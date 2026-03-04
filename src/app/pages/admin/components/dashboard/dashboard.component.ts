import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRecentActivity, ISystemService } from '@pages/admin/models/admin.model';
import { AdminService } from '@pages/admin/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  // Loading / Error
  isLoading = signal(true);
  hasError = signal(false);

  // Stats
  totalUsers = signal(0);
  activeUsers = signal(0);
  totalDetections = signal(0);
  systemHealth = signal(0);
  userGrowth = signal(0);
  detectionGrowth = signal(0);

  // Lists
  recentActivities = signal<IRecentActivity[]>([]);
  systemServices = signal<ISystemService[]>([]);
  topUsers = signal<{ username: string; detections: number; accuracy: number }[]>([]);

  // Time
  lastUpdated = signal(new Date());
  isRefreshing = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
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
          this.isLoading.set(false);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  refreshData(): void {
    this.isRefreshing.set(true);
    this.adminService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
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
          this.isRefreshing.set(false);
        },
        error: () => { this.isRefreshing.set(false); }
      });
  }

  exportReport(): void {
    this.adminService.exportReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => alert('Export failed')
      });
  }

  // Navigation
  viewLogs(): void { this.router.navigate(['/admin/logs']); }
  manageUsers(): void { this.router.navigate(['/admin/users']); }

  // Status helpers
  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'offline': return 'bg-danger';
      default: return 'bg-neutral-grey';
    }
  }

  getStatusTextColor(status: string): string {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'offline': return 'text-danger';
      default: return 'text-font-muted';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user': return 'from-info to-accent-blue';
      case 'detection': return 'from-primary to-accent-purple';
      case 'system': return 'from-success to-success-dark';
      case 'security': return 'from-danger to-danger-dark';
      default: return 'from-neutral-grey to-neutral-d-grey';
    }
  }

}