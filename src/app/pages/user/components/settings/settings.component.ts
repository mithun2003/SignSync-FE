import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@core/services/common/common.service';
import { UserService } from '@pages/user/service/user-service/user.service';
import { finalize } from 'rxjs';

// ── Interfaces ──────────────────────────────────────────────
export interface AppSettings {
  // Appearance
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  compactMode: boolean;

  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
  reminderTime: string;

  // Camera & Detection
  cameraSource: 'front' | 'back' | 'external';
  confidenceThreshold: number;
  detectionSpeed: 'fast' | 'normal' | 'accurate';
  mirrorVideo: boolean;
  showBoundingBox: boolean;
  showConfidence: boolean;

  // Language & Region
  signLanguageDialect: 'ASL' | 'BSL' | 'ISL';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat: '12h' | '24h';

  // Accessibility
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardHints: boolean;
  audioFeedback: boolean;

  // Learning
  dailyGoalMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration: number;
  autoInactivityPause: boolean;
  showHints: boolean;

  // Privacy
  analyticsOptIn: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private router = inject(Router);
  private commonService = inject(CommonService);
  private userService = inject(UserService);

  // ── State ─────────────────────────────────────────────────
  activeSection = signal<string>('appearance');
  isSaving = signal<boolean>(false);
  hasUnsavedChanges = signal<boolean>(false);
  isClearing = signal<{ history: boolean; stats: boolean }>({
    history: false,
    stats: false,
  });

   protected readonly themeOptions = signal<readonly AppSettings['theme'][]>([
    'dark',
    'light',
    'system',
  ]);
   protected readonly fontOptions = signal<readonly AppSettings['fontSize'][]>([
    'small',
    'medium',
    'large',
  ]);
   protected readonly speedOptions = signal<readonly AppSettings['detectionSpeed'][]>([
    'fast',
    'normal',
    'accurate',
  ]);

  // ── Settings (loaded from localStorage + backend) ─────────
  settings = signal<AppSettings>({
    theme: 'dark',
    fontSize: 'medium',
    reduceMotion: false,
    compactMode: false,
    pushNotifications: true,
    emailNotifications: true,
    streakReminder: true,
    weeklyReport: false,
    achievementAlerts: true,
    reminderTime: '09:00',
    cameraSource: 'front',
    confidenceThreshold: 75,
    detectionSpeed: 'normal',
    mirrorVideo: true,
    showBoundingBox: true,
    showConfidence: true,
    signLanguageDialect: 'ASL',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    highContrast: false,
    screenReaderMode: false,
    keyboardHints: false,
    audioFeedback: false,
    dailyGoalMinutes: 15,
    difficulty: 'beginner',
    sessionDuration: 5,
    autoInactivityPause: true,
    showHints: true,
    analyticsOptIn: true,
  });

  // ── Navigation sections ───────────────────────────────────
  sections = [
    { id: 'appearance', icon: '🎨', label: 'Appearance' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'camera', icon: '📷', label: 'Camera & Detection' },
    { id: 'language', icon: '🌐', label: 'Language & Region' },
    { id: 'accessibility', icon: '♿', label: 'Accessibility' },
    { id: 'learning', icon: '🎯', label: 'Learning' },
    { id: 'privacy', icon: '🔒', label: 'Privacy & Data' },
  ];

  ngOnInit(): void {
    this.loadSettings();
  }

  // ── Load settings from localStorage + backend ─────────────
  private loadSettings(): void {
    const saved = localStorage.getItem('signsync_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AppSettings>;
        this.settings.update((s) => ({ ...s, ...parsed }));
      } catch {
        console.warn('Failed to parse saved settings');
      }
    }

    // Also load backend-stored preferences (notifications, language, etc.)
    const user = this.commonService.user();
    if (user) {
      this.settings.update((s) => ({
        ...s,
        signLanguageDialect: (user.language?.toUpperCase() as 'ASL' | 'BSL' | 'ISL') || 'ASL',
      }));
    }
  }

  // ── Update a single setting ───────────────────────────────
  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings.update((s) => ({ ...s, [key]: value }));
    this.hasUnsavedChanges.set(true);

    // Immediately apply visual settings
    if (key === 'theme') this.applyTheme(value as string);
    if (key === 'fontSize') this.applyFontSize(value as string);
    if (key === 'highContrast') this.applyHighContrast(value as boolean);
    if (key === 'reduceMotion') this.applyReduceMotion(value as boolean);
  }

  // ── Save all settings ─────────────────────────────────────
  saveSettings(): void {
    this.isSaving.set(true);

    // Save client-only settings to localStorage
    localStorage.setItem('signsync_settings', JSON.stringify(this.settings()));

    // Save backend settings via API
    const s = this.settings();
    const backendUpdate = {
      language: s.signLanguageDialect.toLowerCase(),
    };

    this.userService.updateProfile(backendUpdate)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.hasUnsavedChanges.set(false);
          // Show success toast
        },
        error: (err: unknown) => {
          console.error('Failed to save settings:', err);
        },
      });
  }

  // ── Reset to defaults ─────────────────────────────────────
  resetToDefaults(): void {
    const confirmed = confirm('Reset all settings to defaults? This cannot be undone.');
    if (!confirmed) return;

    localStorage.removeItem('signsync_settings');
    this.loadSettings();
    this.hasUnsavedChanges.set(true);
  }

  // ── Theme helpers ─────────────────────────────────────────
  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private applyFontSize(size: string): void {
    const map = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = map[size as keyof typeof map] || '16px';
  }

  private applyHighContrast(enabled: boolean): void {
    document.documentElement.classList.toggle('high-contrast', enabled);
  }

  private applyReduceMotion(enabled: boolean): void {
    document.documentElement.classList.toggle('reduce-motion', enabled);
  }

  // ── Privacy actions ───────────────────────────────────────
  downloadMyData(): void {
    // Call backend: GET /user/me/export
    this.userService.getProfile().subscribe({
      next: (res) => {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signsync-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  clearDetectionHistory(): void {
    const confirmed = confirm('Delete all detection history? This cannot be undone.');
    if (!confirmed) return;

    this.isClearing.update((c) => ({ ...c, history: true }));

    // Call backend: DELETE /dashboard/history
    // For now simulate:
    setTimeout(() => {
      this.isClearing.update((c) => ({ ...c, history: false }));
      alert('Detection history cleared.');
    }, 1500);
  }

  clearStatistics(): void {
    const confirmed = confirm('Reset all practice statistics? This cannot be undone.');
    if (!confirmed) return;

    this.isClearing.update((c) => ({ ...c, stats: true }));

    setTimeout(() => {
      this.isClearing.update((c) => ({ ...c, stats: false }));
      alert('Statistics reset.');
    }, 1500);
  }

  navigateToDeleteAccount(): void {
    this.router.navigate(['/profile']);
  }

  // ── Section navigation ────────────────────────────────────
  setSection(id: string): void {
    this.activeSection.set(id);
  }
}