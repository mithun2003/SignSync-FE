// signup.component.ts - Updated with firstName/lastName and new design
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '@pages/auth/service/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptTerms: [false, [Validators.requiredTrue]],
    });
  }

  /**
   * Submit signup form
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Prepare data for API
    const formData = this.form.getRawValue();
    
    // Combine firstName and lastName into name for API (if your API expects 'name')
    const signupData = {
      name: `${formData.firstName} ${formData.lastName}`,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    this.authService.signUp(signupData).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirect to signin or auto-login
        this.router.navigate(['/auth/signin'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);

        // Basic error handling (customize as needed)
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (
          typeof err === 'object' &&
          err !== null &&
          'error' in err &&
          typeof (err as { error?: unknown }).error === 'string'
        ) {
          errorMessage = (err as { error: string }).error;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        this.error.set(errorMessage);

        console.error('Signup error:', err);
      },
    });
  }

  /**
   * Calculate password strength
   */
  getPasswordStrength(): string {
    const password = this.form.get('password')?.value;
    if (!password) return 'weak';

    let score = 0;

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;  // Lowercase
    if (/[A-Z]/.test(password)) score += 1;  // Uppercase
    if (/[0-9]/.test(password)) score += 1;  // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1;  // Special chars

    // Score interpretation
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  /**
   * Get password strength as percentage
   */
  getPasswordStrengthPercentage(): number {
    const password = this.form.get('password')?.value;
    if (!password) return 0;

    let score = 0;

    // Same checks as getPasswordStrength
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Convert to percentage (max score is 6)
    return Math.min((score / 6) * 100, 100);
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}