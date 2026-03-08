import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheck,
  faArrowsRotate,
  faArrowLeft,
  faLock,
  faAt,
  faCircleExclamation,
  faSpinner,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  readonly faCheck = faCheck;
  readonly faArrowsRotate = faArrowsRotate;
  readonly faArrowLeft = faArrowLeft;
  readonly faLock = faLock;
  readonly faAt = faAt;
  readonly faCircleExclamation = faCircleExclamation;
  readonly faSpinner = faSpinner;
  readonly faEnvelope = faEnvelope;

  form: FormGroup;
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  emailSent = signal<string>('');

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const email = this.form.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.emailSent.set(email);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message || 'An error occurred. Please try again.',
        );
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.success.set(false);
    this.error.set(null);
    this.emailSent.set('');
  }
}
