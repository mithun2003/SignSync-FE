import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  IRecentActivity,
  ISystemService,
  IAdminDashboard,
} from '@pages/admin/models/admin.model';
import { IApiRes } from '@models/global.model';

import { AdminService } from '@pages/admin/services/admin.service';
import { AlertService } from 'app/shared/alert/service/alert.service';
import { faSync } from '@fortawesome/pro-regular-svg-icons';
import {
  faFileArrowDown,
  faUsers,
  faBolt,
  faCircleCheck,
  faFileLines,
  faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);
  private alertService = inject(AlertService);

  // ─────────────────────────────────
  // Loading / Error
  // ─────────────────────────────────

  isLoading = signal(true);
  hasError = signal(false);
  isRefreshing = signal(false);

  // ─────────────────────────────────
  // Stats
  // ─────────────────────────────────

  totalUsers = signal(0);
  activeUsers = signal(0);
  totalDetections = signal(0);
  systemHealth = signal(0);
  userGrowth = signal(0);
  detectionGrowth = signal(0);

  faSync = faSync;
  faFileArrowDown = faFileArrowDown;
  faUsers = faUsers;
  faBolt = faBolt;
  faCircleCheck = faCircleCheck;
  faFileLines = faFileLines;
  faArrowsRotate = faArrowsRotate;

  // ─────────────────────────────────
  // Lists
  // ─────────────────────────────────

  recentActivities = signal<IRecentActivity[]>([]);
  systemServices = signal<ISystemService[]>([]);
  topUsers = signal<
    { username: string; detections: number; accuracy: number }[]
  >([]);

  // ─────────────────────────────────
  // Time
  // ─────────────────────────────────

  lastUpdated = signal(new Date());

  // ─────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ─────────────────────────────────
  // Dashboard Loader
  // ─────────────────────────────────

  loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: IApiRes<IAdminDashboard>) => {
          this.applyDashboard(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  // ─────────────────────────────────
  // Refresh Dashboard
  // ─────────────────────────────────

  refreshData(): void {
    if (this.isRefreshing()) return;

    this.isRefreshing.set(true);

    this.adminService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: IApiRes<IAdminDashboard>) => {
          this.applyDashboard(res);
          this.isRefreshing.set(false);
        },
        error: () => {
          this.isRefreshing.set(false);
        },
      });
  }

  // ─────────────────────────────────
  // Apply API Response
  // ─────────────────────────────────

  private applyDashboard(res: IApiRes<IAdminDashboard>): void {
    const d = res.data;

    this.totalUsers.set(d.stats.total_users);
    this.activeUsers.set(d.stats.active_users_today);
    this.totalDetections.set(d.stats.total_detections);
    this.systemHealth.set(d.stats.system_health);
    this.userGrowth.set(d.stats.user_growth_percent);
    this.detectionGrowth.set(d.stats.detection_growth_percent);

    this.recentActivities.set(d.recent_activities);
    this.systemServices.set(d.system_services);
    this.topUsers.set(d.top_users);

    this.lastUpdated.set(new Date());
  }

  // ─────────────────────────────────
  // Export CSV Report
  // ─────────────────────────────────

  exportReport(): void {
    this.adminService
      .exportReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.alertService.alertMessage('fail', {
            content: 'Failed to export report',
          });
        },
      });
  }

  // ─────────────────────────────────
  // Navigation
  // ─────────────────────────────────

  viewLogs(): void {
    this.router.navigate(['/admin/logs']);
  }

  manageUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  // ─────────────────────────────────
  // Status Helpers
  // ─────────────────────────────────

  getStatusColor(status: string): string {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'offline':
        return 'bg-danger';
      default:
        return 'bg-neutral-grey';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'offline':
        return 'text-danger';
      default:
        return 'text-font-muted';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user':
        return 'from-info to-accent-blue';
      case 'detection':
        return 'from-primary to-accent-purple';
      case 'system':
        return 'from-success to-success-dark';
      case 'security':
        return 'from-danger to-danger-dark';
      default:
        return 'from-neutral-grey to-neutral-d-grey';
    }
  }
}
