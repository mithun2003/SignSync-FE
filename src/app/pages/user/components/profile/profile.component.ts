// profile.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonService } from '@core/services/common/common.service';
import { IUserUpdate } from '@pages/user/model/user.model';
import { UserService } from '@pages/user/service/user-service/user.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private commonService = inject(CommonService);
  private userService = inject(UserService);

  // Signals
  profilePhoto = signal('');
  username = signal('Admin User');
  email = signal('admin@example.com');
  memberSince = signal('January 2024');
  totalSigns = signal(1247);
  streak = signal(12);
  twoFactorEnabled = signal(false);
  isSaving = signal(false);

  // Form
  profileForm: FormGroup = this.fb.group({
    username: ['Admin User', Validators.required],
    email: ['admin@example.com', [Validators.required, Validators.email]],
    firstName: ['Admin'],
    lastName: ['User'],
    bio: [''],
    country: ['US'],
    language: ['en'],
  });

  constructor() {
    // Load user data from service if available
    const user = this.commonService.user();
    if (user) {
      this.username.set(user.username || 'User');
      this.email.set(user.email || '');
      this.profilePhoto.set(user.profile_photo || '');
      
      this.profileForm.patchValue({
        username: user.username,
        email: user.email,
      });
    }
  }

  changePhoto() {
    // TODO: Implement file upload
    alert('Photo upload coming soon!');
  }

saveProfile() {
  if (this.profileForm.invalid) return;

  const updateData: IUserUpdate = {
    username: this.profileForm.value.username,
    email: this.profileForm.value.email
  };

  this.isSaving.set(true);

  this.userService.updateProfile(updateData)
    .pipe(
      finalize(() => this.isSaving.set(false))
    )
    .subscribe({
      next: (res) => {
        this.username.set(res.data.username);
        this.email.set(res.data.email);
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to update profile');
      }
    });
}

  resetForm() {
    this.profileForm.reset();
  }

  changePassword() {
    // TODO: Open password change modal
    alert('Password change modal coming soon!');
  }

  toggle2FA() {
    this.twoFactorEnabled.update(v => !v);
    alert(`Two-factor authentication ${this.twoFactorEnabled() ? 'enabled' : 'disabled'}!`);
  }

  deleteAccount() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      // TODO: Call API to delete account
      alert('Account deletion requested. You will receive a confirmation email.');
    }
  }
}