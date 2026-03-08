import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe, KeyValuePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCircleCheck,
  faCloudArrowDown,
  faUsers,
  faArrowsRotate,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '../../services/admin.service';
import { IBackupRecord, IServiceHealth } from '../../models/admin.model';
import { AlertService } from 'app/shared/alert/service/alert.service';

@Component({
  selector: 'app-admin-backup',
  standalone: true,
  imports: [DecimalPipe, KeyValuePipe, FontAwesomeModule],
  templateUrl: './backup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupComponent implements OnInit {
  private adminService = inject(AdminService);
  private alertService = inject(AlertService);

  faCircleCheck = faCircleCheck;
  faCloudArrowDown = faCloudArrowDown;
  faUsers = faUsers;
  faArrowsRotate = faArrowsRotate;
  faCheck = faCheck;

  // System health
  systemStatus = signal('—');
  services = signal<IServiceHealth[]>([]);
  activeUsers = signal(0);

  // Last backup
  lastBackup = signal<IBackupRecord | null>(null);
  lastBackupAgo = signal('—');

  // Notification toggles (local UI state — no backend endpoint)
  notificationsEnabled = signal(false);
  emailAlertsEnabled = signal(false);
  backupAlertsEnabled = signal(false);

  // Operation states
  isLoadingHealth = signal(true);
  isLoadingBackup = signal(true);
  isCreatingBackup = signal(false);
  isClearingCache = signal(false);
  cacheCleared = signal(false);
  cacheMessage = signal('');
  backupSuccess = signal(false);
  healthError = signal('');

  ngOnInit(): void {
    this.loadSystemHealth();
    this.loadBackupInfo();
    this.loadActiveUsers();
  }

  private loadSystemHealth(): void {
    this.isLoadingHealth.set(true);
    this.healthError.set('');
    this.adminService.getSystemHealth().subscribe({
      next: (res) => {
        const h = res.data;
        this.systemStatus.set(h.status);
        this.services.set(h.services);
        this.isLoadingHealth.set(false);
      },
      error: () => {
        this.healthError.set('Could not load system health.');
        this.isLoadingHealth.set(false);
      },
    });
  }

  private loadBackupInfo(): void {
    this.isLoadingBackup.set(true);
    this.adminService.getBackupInfo().subscribe({
      next: (res) => {
        this.lastBackup.set(res.last_backup);
        this.lastBackupAgo.set(
          res.last_backup ? this.timeAgo(res.last_backup.created_at) : 'Never',
        );
        this.isLoadingBackup.set(false);
      },
      error: () => this.isLoadingBackup.set(false),
    });
  }

  private loadActiveUsers(): void {
    this.adminService.getActiveUsers(24).subscribe({
      next: (res) => this.activeUsers.set(res.total),
      error: () => {
        /* empty */
      },
    });
  }

  createBackup(): void {
    this.isCreatingBackup.set(true);
    this.backupSuccess.set(false);
    this.adminService.createBackup().subscribe({
      next: (res) => {
        this.isCreatingBackup.set(false);
        this.backupSuccess.set(true);
        if (res.last_backup) {
          this.lastBackup.set(res.last_backup);
          this.lastBackupAgo.set('just now');
        }
      },
      error: () => {
        this.isCreatingBackup.set(false);
        this.alertService.alertMessage('fail', {
          content: 'Backup failed. Please try again.',
        });
      },
    });
  }

  clearCache(): void {
    this.isClearingCache.set(true);
    this.cacheCleared.set(false);
    this.adminService.clearCache().subscribe({
      next: (res) => {
        this.isClearingCache.set(false);
        this.cacheCleared.set(true);
        this.cacheMessage.set(res.message);
      },
      error: () => {
        this.isClearingCache.set(false);
        this.alertService.alertMessage('fail', {
          content: 'Failed to clear cache. Please try again.',
        });
      },
    });
  }

  toggleNotification(
    key: 'notificationsEnabled' | 'emailAlertsEnabled' | 'backupAlertsEnabled',
  ): void {
    this[key].update((v) => !v);
  }

  formatBytes(bytes: number): string {
    if (bytes >= 1_073_741_824)
      return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  serviceStatusColor(status: string): string {
    if (status === 'online') return 'text-success';
    if (status === 'warning') return 'text-warning';
    return 'text-danger';
  }

  serviceStatusBg(status: string): string {
    if (status === 'online') return 'bg-success/10 border-success/30';
    if (status === 'warning') return 'bg-warning/10 border-warning/30';
    return 'bg-danger/10 border-danger/30';
  }

  overallStatusColor(status: string): string {
    if (status === 'healthy' || status === 'online') return 'text-success';
    if (status === 'degraded') return 'text-warning';
    return 'text-danger';
  }

  private timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (mins < 1) return 'just now';
    if (hours < 1) return `${mins}m ago`;
    if (days < 1) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
