// signin.component.ts - Updated getErrorMessage with proper typing

import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '@core/services/common/common.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { AuthService } from '@pages/auth/service/auth.service';
import { FastAPIErrorResponse, ValidationError } from '@pages/auth/model/auth.model';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private commonService = inject(CommonService);

  form: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formData = new FormData();
    formData.append('username', this.form.get('username')?.value ?? '');
    formData.append('password', this.form.get('password')?.value ?? '');

    this.authService.login(formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.localStorageService.setItem('accessToken', res.data.access_token);
        this.localStorageService.setItem('userRole', res.data.user_role);
        this.commonService.getSession();

        if (this.form.get('rememberMe')?.value) {
          this.localStorageService.setItem('rememberMe', 'true');
        }

        const userRole = res?.data?.user_role;
        if (userRole === 'admin') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const errorMessage = this.getErrorMessage(err);
        this.error.set(errorMessage);
        console.error('Login error:', err);
      },
    });
  }

  /**
   * ✅ PROPERLY TYPED - Extract error message from API response
   */
  private getErrorMessage(err: unknown): string {
    // Type guard: Check if error is HttpErrorResponse
    if (!this.isHttpErrorResponse(err)) {
      return 'An error occurred during sign-in. Please try again.';
    }

    const error = err as HttpErrorResponse;

    // Check for FastAPI error response
    if (error.error && typeof error.error === 'object') {
      const errorObj = error.error as FastAPIErrorResponse;

      // Handle string detail
      if (typeof errorObj.detail === 'string') {
        return errorObj.detail;
      }

      // Handle validation errors array
      if (Array.isArray(errorObj.detail) && errorObj.detail.length > 0) {
        const firstDetail = errorObj.detail[0] as ValidationError;
        return firstDetail?.msg || 'Invalid credentials';
      }

      // Handle message field
      if (typeof errorObj.message === 'string') {
        return errorObj.message;
      }
    }

    // Handle HTTP status codes
    if (error.status === 401) {
      return 'Invalid username or password';
    }

    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }

    return 'An error occurred during sign-in. Please try again.';
  }

  /**
   * Type guard to check if error is HttpErrorResponse
   */
  private isHttpErrorResponse(err: unknown): err is HttpErrorResponse {
    return (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      'error' in err &&
      typeof (err as HttpErrorResponse).status === 'number'
    );
  }
}