import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  OnInit,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAnglesLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import { AdminService } from '@pages/admin/services/admin.service';
import {
  NAV_SECTIONS,
  QUICK_ACTIONS,
  type NavSection,
  type QuickAction,
} from './admin-sidebar.data';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, FontAwesomeModule],
  templateUrl: './admin-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  collapsed = input<boolean>(false);
  mobileMenuClose = output<void>();
  collapsedChange = output<boolean>();

  readonly navSections: NavSection[] = NAV_SECTIONS;
  readonly quickActions: QuickAction[] = QUICK_ACTIONS;

  readonly systemHealth = signal(0);
  readonly lastBackup = signal('—');
  readonly activeUsers = signal(0);

  readonly isBackingUp = signal(false);
  readonly isClearingCache = signal(false);

  faAnglesLeft = faAnglesLeft;
  faXmark = faXmark;

  ngOnInit(): void {
    this.adminService.getSystemHealth().subscribe({
      next: ({ data }) => {
        const services = data.services;
        const active = services.filter((s) => s.status !== 'disabled');
        const online = active.filter((s) => s.status === 'online').length;
        this.systemHealth.set(
          active.length ? Math.round((online / active.length) * 100) : 0,
        );
      },
      error: () => {
        /* empty */
      },
    });

    this.adminService.getBackupInfo().subscribe({
      next: (info) => {
        if (info.last_backup?.created_at) {
          this.lastBackup.set(this.timeAgo(info.last_backup.created_at));
        }
      },
      error: () => {
        /* empty */
      },
    });

    this.adminService.getActiveUsers(24).subscribe({
      next: (res) => this.activeUsers.set(res.total),
      error: () => {
        /* empty */
      },
    });
  }

  toggleCollapse(): void {
    const newValue = !this.collapsed();
    this.collapsedChange.emit(newValue);
    localStorage.setItem('admin-sidebar-collapsed', String(newValue));
  }

  closeMobileMenu(): void {
    this.mobileMenuClose.emit();
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'createBackup':
        this.createBackup();
        break;
      case 'clearCache':
        this.clearCache();
        break;
    }
  }

  private createBackup(): void {
    if (this.isBackingUp()) return;
    this.isBackingUp.set(true);
    this.adminService.createBackup().subscribe({
      next: (info) => {
        this.isBackingUp.set(false);
        if (info.last_backup?.created_at) {
          this.lastBackup.set(this.timeAgo(info.last_backup.created_at));
        }
      },
      error: () => this.isBackingUp.set(false),
    });
  }

  private clearCache(): void {
    if (this.isClearingCache()) return;
    this.isClearingCache.set(true);
    this.adminService.clearCache().subscribe({
      next: () => this.isClearingCache.set(false),
      error: () => this.isClearingCache.set(false),
    });
  }

  private timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
