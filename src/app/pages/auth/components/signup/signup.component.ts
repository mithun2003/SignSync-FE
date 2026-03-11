import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserPlus,
  faUser,
  faAt,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faCircleExclamation,
  faXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@pages/auth/service/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe, FontAwesomeModule],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  faUserPlus = faUserPlus;
  faUser = faUser;
  faAt = faAt;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCircleExclamation = faCircleExclamation;
  faXmark = faXmark;
  faSpinner = faSpinner;

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

    const signupData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    this.authService.signUp(signupData).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirect to signin or auto-login
        this.router.navigate(['/auth/signin'], {
          queryParams: { registered: 'true' },
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
   * Shared password score calculation (0-6)
   */
  private calcPasswordScore(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  getPasswordStrength(): string {
    const score = this.calcPasswordScore(this.form.get('password')?.value);
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthPercentage(): number {
    return Math.min(
      (this.calcPasswordScore(this.form.get('password')?.value) / 6) * 100,
      100,
    );
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
