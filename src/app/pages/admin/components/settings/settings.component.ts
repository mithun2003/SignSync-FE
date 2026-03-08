import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSpinner,
  faArrowsRotate,
  faCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { IAdminSettings } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';

interface SettingsTab {
  id: string;
  name: string;
}

interface AppSettings {
  general: {
    appName: string;
    appDescription: string;
    timezone: string;
    language: string;
  };
  security: {
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    sessionTimeout: number;
    enable2FA: boolean;
  };
  notifications: {
    email: {
      newUsers: boolean;
      systemAlerts: boolean;
      backupCompletion: boolean;
    };
    inApp: { showBadges: boolean; autoDismiss: boolean };
  };
  system: {
    cacheDuration: number;
    debugMode: boolean;
    maintenanceMode: boolean;
    autoBackup: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: 'SignSync',
    appDescription: 'AI-powered sign language detection and learning platform',
    timezone: 'UTC',
    language: 'en',
  },
  security: {
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    sessionTimeout: 30,
    enable2FA: false,
  },
  notifications: {
    email: { newUsers: true, systemAlerts: true, backupCompletion: false },
    inApp: { showBadges: true, autoDismiss: true },
  },
  system: {
    cacheDuration: 2,
    debugMode: false,
    maintenanceMode: false,
    autoBackup: true,
  },
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly faSpinner = faSpinner;
  readonly faArrowsRotate = faArrowsRotate;
  readonly faCheck = faCheck;
  readonly faCircleExclamation = faCircleExclamation;

  readonly settingsTabs = signal<SettingsTab[]>([
    { id: 'general', name: 'General' },
    { id: 'security', name: 'Security' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'system', name: 'System' },
  ]);

  readonly activeTab = signal<string>('general');
  readonly isLoading = signal(true);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('success');
  readonly settings = signal<AppSettings>({ ...DEFAULT_SETTINGS });

  ngOnInit(): void {
    this.adminService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(this.fromApi(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showMessage(
          'Could not load settings — showing defaults.',
          'error',
        );
      },
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  saveSettings(): void {
    this.saving.set(true);
    this.adminService.updateSettings(this.toApi(this.settings())).subscribe({
      next: (data) => {
        this.settings.set(this.fromApi(data));
        this.saving.set(false);
        this.showMessage('Settings saved successfully!', 'success');
      },
      error: () => {
        this.saving.set(false);
        this.showMessage('Failed to save settings. Please try again.', 'error');
      },
    });
  }

  resetToDefaults(): void {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      this.adminService.updateSettings(this.toApi(DEFAULT_SETTINGS)).subscribe({
        next: (data) => {
          this.settings.set(this.fromApi(data));
          this.showMessage('Settings reset to defaults!', 'success');
        },
        error: () => this.showMessage('Failed to reset settings.', 'error'),
      });
    }
  }

  private fromApi(data: IAdminSettings): AppSettings {
    return {
      general: {
        appName: data.general?.app_name ?? DEFAULT_SETTINGS.general.appName,
        appDescription:
          data.general?.app_description ??
          DEFAULT_SETTINGS.general.appDescription,
        timezone: data.general?.timezone ?? DEFAULT_SETTINGS.general.timezone,
        language: data.general?.language ?? DEFAULT_SETTINGS.general.language,
      },
      security: {
        minPasswordLength:
          data.security?.min_password_length ??
          DEFAULT_SETTINGS.security.minPasswordLength,
        requireUppercase:
          data.security?.require_uppercase ??
          DEFAULT_SETTINGS.security.requireUppercase,
        requireNumbers:
          data.security?.require_numbers ??
          DEFAULT_SETTINGS.security.requireNumbers,
        requireSpecialChars:
          data.security?.require_special_chars ??
          DEFAULT_SETTINGS.security.requireSpecialChars,
        sessionTimeout:
          data.security?.session_timeout ??
          DEFAULT_SETTINGS.security.sessionTimeout,
        enable2FA:
          data.security?.enable_2fa ?? DEFAULT_SETTINGS.security.enable2FA,
      },
      notifications: {
        email: {
          newUsers:
            data.notifications?.email?.new_users ??
            DEFAULT_SETTINGS.notifications.email.newUsers,
          systemAlerts:
            data.notifications?.email?.system_alerts ??
            DEFAULT_SETTINGS.notifications.email.systemAlerts,
          backupCompletion:
            data.notifications?.email?.backup_completion ??
            DEFAULT_SETTINGS.notifications.email.backupCompletion,
        },
        inApp: {
          showBadges:
            data.notifications?.in_app?.show_badges ??
            DEFAULT_SETTINGS.notifications.inApp.showBadges,
          autoDismiss:
            data.notifications?.in_app?.auto_dismiss ??
            DEFAULT_SETTINGS.notifications.inApp.autoDismiss,
        },
      },
      system: {
        cacheDuration:
          data.system?.cache_duration ?? DEFAULT_SETTINGS.system.cacheDuration,
        debugMode: data.system?.debug_mode ?? DEFAULT_SETTINGS.system.debugMode,
        maintenanceMode:
          data.system?.maintenance_mode ??
          DEFAULT_SETTINGS.system.maintenanceMode,
        autoBackup:
          data.system?.auto_backup ?? DEFAULT_SETTINGS.system.autoBackup,
      },
    };
  }

  private toApi(s: AppSettings): IAdminSettings {
    return {
      general: {
        app_name: s.general.appName,
        app_description: s.general.appDescription,
        timezone: s.general.timezone,
        language: s.general.language,
      },
      security: {
        min_password_length: s.security.minPasswordLength,
        require_uppercase: s.security.requireUppercase,
        require_numbers: s.security.requireNumbers,
        require_special_chars: s.security.requireSpecialChars,
        session_timeout: s.security.sessionTimeout,
        enable_2fa: s.security.enable2FA,
      },
      notifications: {
        email: {
          new_users: s.notifications.email.newUsers,
          system_alerts: s.notifications.email.systemAlerts,
          backup_completion: s.notifications.email.backupCompletion,
        },
        in_app: {
          show_badges: s.notifications.inApp.showBadges,
          auto_dismiss: s.notifications.inApp.autoDismiss,
        },
      },
      system: {
        cache_duration: s.system.cacheDuration,
        debug_mode: s.system.debugMode,
        maintenance_mode: s.system.maintenanceMode,
        auto_backup: s.system.autoBackup,
      },
    };
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 3000);
  }
}
