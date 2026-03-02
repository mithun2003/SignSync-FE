// profile.component.ts — FULLY TYPED (no 'any')
import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { IUserRead } from '@models/global.model';
import { IUserUpdate } from '@pages/user/model/user.model';     // ✅ Import IUserRead
import { UserService } from '@pages/user/service/user-service/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private userService = inject(UserService);
  private router = inject(Router);

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

  // Form includes ALL editable fields
  profileForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    firstName: [''],
    lastName: [''],
    bio: [''],
    country: [''],
    language: ['en'],
  });

  ngOnInit(): void {
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
      error: (err: Error) => console.error('Failed to load profile:', err)
    });
  }


  // ✅ FIXED: 'any' → IUserRead — proper interface
  private populateFromUser(user: IUserRead): void {
    this.username.set(user.username ?? '');
    this.email.set(user.email ?? '');
    this.twoFactorEnabled.set(user.two_factor_enabled ?? false);
    this.profilePhoto.set(this.commonService.buildImageUrl(user.profile_image_url));


    // Calculate member since from created_at if available
    if (user.created_at) {
      const date = new Date(user.created_at);
      this.memberSince.set(
        date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
        alert('File too large. Maximum size is 5MB.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed: JPG, PNG, GIF, WebP');
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
      this.userService.uploadProfileImage(file)
        .pipe(finalize(() => this.isUploading.set(false)))
        .subscribe({
          next: (res) => {
            // Replace preview with actual server URL
            this.profilePhoto.set(this.commonService.buildImageUrl(res.data.profile_image_url));
            this.commonService.setUser(res.data);
          },
          error: (err: { error?: { detail?: string } }) => {
            // Revert to previous photo on failure
            this.profilePhoto.set(previousPhoto);
            const message: string = err.error?.detail ?? 'Failed to upload image';
            alert(message);
          }
        });
    };
    input.click();
  }

 removePhoto(): void {
    if (!this.profilePhoto()) return;
    const confirmed = confirm('Remove your profile photo?');
    if (!confirmed) return;
    this.isUploading.set(true);
    this.userService.deleteProfileImage()
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: (res) => {
          this.profilePhoto.set('');
          this.commonService.setUser(res.data);
        },
        error: (err: { error?: { detail?: string } }) => {
          const message: string = err.error?.detail ?? 'Failed to remove image';
          alert(message);
        }
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

    this.userService.updateProfile(updateData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (res) => {
          this.username.set(res.data.username);
          this.email.set(res.data.email);
          this.profilePhoto.set(this.commonService.buildImageUrl(res.data.profile_image_url));
          this.twoFactorEnabled.set(res.data.two_factor_enabled);

          this.commonService.setUser(res.data);
          alert('Profile updated successfully!');
        },
        error: (err: { error?: { detail?: string } }) => {
          console.error('Profile update failed:', err);
          const message: string = err.error?.detail ?? 'Failed to update profile';
          alert(message);
        }
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
    this.router.navigate(['/change-password']);
  }

  // ✅ Calls API to toggle 2FA
  toggle2FA(): void {
    const newValue = !this.twoFactorEnabled();

    this.userService.updateProfile({ two_factor_enabled: newValue })
      .subscribe({
        next: (res) => {
          this.twoFactorEnabled.set(res.data.two_factor_enabled);
          alert(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}!`);
        },
        error: (err: Error) => {
          console.error('2FA toggle failed:', err);
          alert('Failed to toggle two-factor authentication');
        }
      });
  }

  // ✅ Calls DELETE /user/me and redirects
  deleteAccount(): void {
    const confirmed: boolean = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirm: boolean = confirm(
      'FINAL WARNING: All your data will be permanently deleted. Type OK to confirm.'
    );

    if (!doubleConfirm) return;

    this.isDeleting.set(true);

    this.userService.deleteAccount()
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.commonService.clearUser();
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: (err: Error) => {
          console.error('Account deletion failed:', err);
          alert('Failed to delete account. Please try again.');
        }
      });
  }
}