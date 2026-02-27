import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { AuthService } from '@pages/auth/service/auth.service';
// import { AuthService } from '@core/services/auth.service';

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

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  //   submit() {
  //     if (this.form.invalid) return;
  //     this.loading.set(true);
  //     this.error.set(null);
  //     this.router.navigateByUrl('/');
  //     this.loading.set(false);
  //     this.authService.login(this.form.getRawValue()).subscribe({
  //       next: () => {
  //         this.loading.set(false);
  //         const returnUrl = this.router.getCurrentNavigation()?.extras?.queryParams?.['returnUrl'] || '/admin';
  //         this.router.navigateByUrl(returnUrl);
  //       },
  //       error: (err) => {
  //         this.loading.set(false);
  //         this.error.set(err?.error?.message || 'An error occurred during sign-in');
  //       }
  //     });
  //   }
  // }
  submit() {
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

        // Optional: role-based redirect
        const user_role = res?.data?.user_role;
        if (user_role == 'admin') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/');
        }
        this.localStorageService.setItem('accessToken', res.data.access_token);
        this.localStorageService.setItem('userRole', user_role);
        this.commonService.getSession();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail || 'Invalid email or password');
      },
    });
  }
}
