import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { finalize } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronLeft,
  faCheck,
  faCircleExclamation,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '@pages/user/service/user-service/user.service';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private userService = inject(UserService);

  faChevronLeft = faChevronLeft;
  faCheck = faCheck;
  faCircleExclamation = faCircleExclamation;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  isSaving = signal(false);
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  form: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const { currentPassword, newPassword } = this.form.value;

    this.userService
      .changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Password changed successfully!');
          this.form.reset();
        },
        error: (err: { error?: { detail?: string } }) => {
          this.errorMessage.set(
            err.error?.detail ?? 'Failed to change password.',
          );
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
