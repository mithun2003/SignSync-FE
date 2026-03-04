// admin-header.component.ts
import {
  Component, signal, EventEmitter, Output,
  inject, HostListener, DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, map } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass, faBell, faUser,
  faGear, faCircleQuestion, faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

import { CommonService } from '@core/services/common/common.service';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [FormsModule, FontAwesomeModule],
  templateUrl: './admin-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  private commonService = inject(CommonService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @Output() mobileMenuToggle = new EventEmitter<void>();

  // Icons
  faMagnifyingGlass = faMagnifyingGlass;
  faBell = faBell;
  faUser = faUser;
  faGear = faGear;
  faCircleQuestion = faCircleQuestion;
  faRightFromBracket = faRightFromBracket;

  // State
  searchQuery = signal('');
  showUserMenu = signal(false);
  showNotifications = signal(false);
  currentPage = signal('Dashboard');

  // Notifications
  notifications = signal<Notification[]>([
    { id: 1, title: 'New user registered', message: 'John Doe just signed up',
      time: '5m ago', read: false, type: 'info' },
    { id: 2, title: 'System update', message: 'v2.1 deployed successfully',
      time: '1h ago', read: false, type: 'success' },
    { id: 3, title: 'High memory usage', message: 'Server using 85% RAM',
      time: '3h ago', read: true, type: 'warning' },
  ]);

  unreadCount = signal(2);

  constructor() {
    // Auto-update breadcrumb from Router
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => {
        const segment = e.urlAfterRedirects.split('/').pop() || 'dashboard';
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(page => this.currentPage.set(page));
  }

  // Click-outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-area')) {
      this.showUserMenu.set(false);
    }
    if (!target.closest('.notification-area')) {
      this.showNotifications.set(false);
    }
  }

  getUserInitials(): string {
    const user = this.commonService.user();
    const name = user?.first_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get userName(): string {
    const user = this.commonService.user();
    return user?.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : 'Admin User';
  }

  get userEmail(): string {
    return this.commonService.user()?.email || 'admin@example.com';
  }

  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  markAllRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
    this.unreadCount.set(0);
  }

  signOut(): void {
    this.commonService.signOut();
  }
}