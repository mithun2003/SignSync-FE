import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { IUserRead } from '@models/global.model';
import { IUserUpdate } from '@pages/user/model/user.model'; // ✅ Import IUserRead
import { UserService } from '@pages/user/service/user-service/user.service';
import { finalize } from 'rxjs';
import { AlertService } from 'app/shared/alert/service/alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  // Signals — all properly typed
  profilePhoto = signal<string>('');
  username = signal<string>('');
  email = signal<string>('');
  memberSince = signal<string>('');
  totalSigns = signal<number>(0);
  streak = signal<number>(0);
  twoFactorEnabled = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  isAdmin = signal<boolean>(false);

  readonly containerClass = computed(
    () =>
      `min-h-screen bg-linear-to-b from-bg-primary via-bg-secondary to-bg-primary text-white ${
        this.isAdmin() ? 'p-6' : 'pt-24 pb-12 px-6'
      }`,
  );

  // Form includes ALL editable fields
  profileForm: FormGroup = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(20)],
    ],
    email: ['', [Validators.required, Validators.email]],
    firstName: [''],
    lastName: [''],
    bio: [''],
    country: [''],
    language: ['en'],
  });

  ngOnInit(): void {
    this.isAdmin.set(this.route.snapshot.data['isAdmin'] === true);
    this.loadProfile();
  }

  // ✅ Load profile from API (not just from cached user)
  private loadProfile(): void {
    const user: IUserRead | null = this.commonService.user();
    if (user) {
      this.populateFromUser(user);
    }

    // Fetch fresh data from API
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.populateFromUser(res.data);
        this.commonService.setUser(res.data);
      },
      error: (err: unknown) => console.error('Failed to load profile:', err),
    });
  }

  // ✅ FIXED: 'any' → IUserRead — proper interface
  private populateFromUser(user: IUserRead): void {
    this.username.set(user.username ?? '');
    this.email.set(user.email ?? '');
    this.twoFactorEnabled.set(user.two_factor_enabled ?? false);
    this.profilePhoto.set(
      this.commonService.buildImageUrl(user.profile_image_url),
    );

    // Calculate member since from created_at if available
    if (user.created_at) {
      const date = new Date(user.created_at);
      this.memberSince.set(
        date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      );
    }

    this.profileForm.patchValue({
      username: user.username ?? '',
      email: user.email ?? '',
      firstName: user.first_name ?? '',
      lastName: user.last_name ?? '',
      bio: user.bio ?? '',
      country: user.country ?? '',
      language: user.language ?? 'en',
    });
  }

  // ✅ FIXED: 'any' → proper Event + HTMLInputElement typing
  changePhoto(): void {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.onchange = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      const file: File | undefined = target.files?.[0];
      if (!file) return;
      // Client-side validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.alertService.alertMessage('warning', {
          content: 'File too large. Maximum size is 5MB.',
        });
        return;
      }
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.alertService.alertMessage('warning', {
          content: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP',
        });
        return;
      }
      // Optimistic preview via FileReader
      const previousPhoto: string = this.profilePhoto();
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          this.profilePhoto.set(result);
        }
      };
      reader.readAsDataURL(file);
      // Upload to backend via ApiService
      this.isUploading.set(true);
      this.userService
        .uploadProfileImage(file)
        .pipe(finalize(() => this.isUploading.set(false)))
        .subscribe({
          next: (res) => {
            // Replace preview with actual server URL
            this.profilePhoto.set(
              this.commonService.buildImageUrl(res.data.profile_image_url),
            );
            this.commonService.setUser(res.data);
          },
          error: (err: { error?: { detail?: string } }) => {
            // Revert to previous photo on failure
            this.profilePhoto.set(previousPhoto);
            const message: string =
              err.error?.detail ?? 'Failed to upload image';
            this.alertService.alertMessage('fail', { content: message });
          },
        });
    };
    input.click();
  }

  removePhoto(): void {
    if (!this.profilePhoto()) return;
    const confirmed = confirm('Remove your profile photo?');
    if (!confirmed) return;
    this.isUploading.set(true);
    this.userService
      .deleteProfileImage()
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: (res) => {
          this.profilePhoto.set('');
          this.commonService.setUser(res.data);
        },
        error: (err: { error?: { detail?: string } }) => {
          const message: string = err.error?.detail ?? 'Failed to remove image';
          this.alertService.alertMessage('fail', { content: message });
        },
      });
  }

  // ✅ Sends ALL form fields with camelCase → snake_case mapping
  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const formValue = this.profileForm.value;

    const updateData: IUserUpdate = {
      username: formValue.username,
      email: formValue.email,
      first_name: formValue.firstName,
      last_name: formValue.lastName,
      bio: formValue.bio,
      country: formValue.country,
      language: formValue.language,
    };

    this.isSaving.set(true);

    this.userService
      .updateProfile(updateData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (res) => {
          this.username.set(res.data.username);
          this.email.set(res.data.email);
          this.profilePhoto.set(
            this.commonService.buildImageUrl(res.data.profile_image_url),
          );
          this.twoFactorEnabled.set(res.data.two_factor_enabled);

          this.commonService.setUser(res.data);
          this.alertService.alertMessage('success', {
            content: 'Profile updated successfully!',
            close: true,
            timeout: 3000,
          });
        },
        error: (err: { error?: { detail?: string } }) => {
          console.error('Profile update failed:', err);
          const message: string =
            err.error?.detail ?? 'Failed to update profile';
          this.alertService.alertMessage('fail', { content: message });
        },
      });
  }

  // ✅ Reset to last saved values (not empty)
  resetForm(): void {
    const user: IUserRead | null = this.commonService.user();
    if (user) {
      this.populateFromUser(user);
    }
  }

  changePassword(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin/change-password']);
    } else {
      this.router.navigate(['/change-password']);
    }
  }

  // ✅ Calls API to toggle 2FA
  toggle2FA(): void {
    const newValue = !this.twoFactorEnabled();

    this.userService.updateProfile({ two_factor_enabled: newValue }).subscribe({
      next: (res) => {
        this.twoFactorEnabled.set(res.data.two_factor_enabled);
        this.alertService.alertMessage('success', {
          content: `Two-factor authentication ${newValue ? 'enabled' : 'disabled'}!`,
          close: true,
          timeout: 3000,
        });
      },
      error: (err: Error) => {
        console.error('2FA toggle failed:', err);
        this.alertService.alertMessage('fail', {
          content: 'Failed to toggle two-factor authentication',
        });
      },
    });
  }

  // ✅ Calls DELETE /user/me and redirects
  deleteAccount(): void {
    const confirmed: boolean = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.',
    );

    if (!confirmed) return;

    const doubleConfirm: boolean = confirm(
      'FINAL WARNING: All your data will be permanently deleted. Type OK to confirm.',
    );

    if (!doubleConfirm) return;

    this.isDeleting.set(true);

    this.userService
      .deleteAccount()
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.commonService.clearUser();
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: (err: Error) => {
          console.error('Account deletion failed:', err);
          this.alertService.alertMessage('fail', {
            content: 'Failed to delete account. Please try again.',
          });
        },
      });
  }
}
