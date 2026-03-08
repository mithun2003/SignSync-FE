// admin-header.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass,
  faBell,
  faUser,
  faGear,
  faCircleQuestion,
  faRightFromBracket,
  faHouse,
  faUsers,
  faChartBar,
  faClipboardList,
  faCloudArrowUp,
  faScroll,
  faDownload,
  faArrowsRotate,
  faKey,
  faShield,
  faBars,
  faChevronRight,
  faChevronDown,
  type IconDefinition,
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

interface SearchItem {
  label: string;
  description: string;
  route: string;
  icon: IconDefinition;
  keywords: string[];
  category: 'Navigation' | 'Account' | 'Settings' | 'Quick Action';
}

const SEARCH_INDEX: SearchItem[] = [
  {
    label: 'Dashboard',
    description: 'Overview, stats and quick metrics',
    route: '/admin/dashboard',
    icon: faHouse,
    category: 'Navigation',
    keywords: ['home', 'overview', 'stats', 'metrics', 'summary'],
  },
  {
    label: 'Users',
    description: 'Manage and search registered users',
    route: '/admin/users',
    icon: faUsers,
    category: 'Navigation',
    keywords: ['accounts', 'members', 'search users', 'delete user', 'suspend'],
  },
  {
    label: 'Analytics',
    description: 'User registrations and usage trends',
    route: '/admin/analytics',
    icon: faChartBar,
    category: 'Navigation',
    keywords: ['charts', 'reports', 'registrations', 'countries', 'graph'],
  },
  {
    label: 'Sign Management',
    description: 'Upload and manage ASL sign videos',
    route: '/admin/signs',
    icon: faClipboardList,
    category: 'Navigation',
    keywords: ['signs', 'asl', 'videos', 'upload', 'model', 'alphabet'],
  },
  {
    label: 'Backup & System',
    description: 'System health, backups and cache',
    route: '/admin/backup',
    icon: faCloudArrowUp,
    category: 'Navigation',
    keywords: ['backup', 'health', 'cache', 'restore', 'redis', 'services'],
  },
  {
    label: 'Settings',
    description: 'General, security and notification config',
    route: '/admin/settings',
    icon: faGear,
    category: 'Navigation',
    keywords: ['config', 'preferences', 'general', 'notifications', 'app name'],
  },
  {
    label: 'System Logs',
    description: 'View audit and system event logs',
    route: '/admin/logs',
    icon: faScroll,
    category: 'Navigation',
    keywords: ['logs', 'audit', 'events', 'history', 'activity'],
  },
  {
    label: 'Change Password',
    description: 'Update your admin account password',
    route: '/admin/change-password',
    icon: faKey,
    category: 'Account',
    keywords: ['password', 'credentials', 'security', 'update password'],
  },
  {
    label: 'Profile',
    description: 'View and edit your admin profile',
    route: '/admin/profile',
    icon: faUser,
    category: 'Account',
    keywords: ['profile', 'account', 'personal', 'avatar', 'bio'],
  },
  {
    label: 'Security Settings',
    description: 'Password policy, 2FA, session timeout',
    route: '/admin/settings',
    icon: faShield,
    category: 'Settings',
    keywords: ['security', 'password policy', '2fa', 'session', 'auth'],
  },
  {
    label: 'Create Backup',
    description: 'Take a full system backup now',
    route: '/admin/backup',
    icon: faDownload,
    category: 'Quick Action',
    keywords: ['backup', 'snapshot', 'export', 'create backup'],
  },
  {
    label: 'Clear Cache',
    description: 'Flush the Redis application cache',
    route: '/admin/backup',
    icon: faArrowsRotate,
    category: 'Quick Action',
    keywords: ['cache', 'clear', 'flush', 'redis', 'purge'],
  },
];

const CATEGORY_COLORS: Record<SearchItem['category'], string> = {
  Navigation: 'bg-info/15 text-info',
  Account: 'bg-primary/15 text-primary-light',
  Settings: 'bg-bg-hover text-font-muted',
  'Quick Action': 'bg-warning/15 text-warning',
};

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [FontAwesomeModule, RouterModule],
  templateUrl: './admin-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  private readonly commonService = inject(CommonService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Output() mobileMenuToggle = new EventEmitter<void>();

  // ── Icons ──────────────────────────────────────────────────────────────────
  faMagnifyingGlass = faMagnifyingGlass;
  faBell = faBell;
  faUser = faUser;
  faGear = faGear;
  faCircleQuestion = faCircleQuestion;
  faRightFromBracket = faRightFromBracket;
  faBars = faBars;
  faChevronRight = faChevronRight;
  faChevronDown = faChevronDown;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly focusedIndex = signal(-1);
  readonly showUserMenu = signal(false);
  readonly showNotifications = signal(false);
  readonly currentPage = signal('Dashboard');

  readonly searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)),
    ).slice(0, 8);
  });

  readonly showSearch = computed(
    () => this.searchFocused() && this.searchResults().length > 0,
  );

  readonly categoryColors = CATEGORY_COLORS;

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'New user registered',
      message: 'John Doe just signed up',
      time: '5m ago',
      read: false,
      type: 'info',
    },
    {
      id: 2,
      title: 'System update',
      message: 'v2.1 deployed successfully',
      time: '1h ago',
      read: false,
      type: 'success',
    },
    {
      id: 3,
      title: 'High memory usage',
      message: 'Server using 85% RAM',
      time: '3h ago',
      read: true,
      type: 'warning',
    },
  ]);
  unreadCount = signal(2);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => {
          const segment = e.urlAfterRedirects.split('/').pop() || 'dashboard';
          return (
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, ' ')
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        this.currentPage.set(page);
        this.searchQuery.set('');
      });
  }

  // ── Click-outside handler ──────────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-area')) this.showUserMenu.set(false);
    if (!target.closest('.notification-area'))
      this.showNotifications.set(false);
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.focusedIndex.set(-1);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const results = this.searchResults();
    switch (event.key) {
      case 'Escape':
        this.searchQuery.set('');
        (event.target as HTMLInputElement).blur();
        break;
      case 'Enter': {
        const idx = this.focusedIndex() >= 0 ? this.focusedIndex() : 0;
        if (results[idx]) this.navigateTo(results[idx]);
        break;
      }
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update((i) => Math.max(i - 1, 0));
        break;
    }
  }

  onSearchBlur(): void {
    // Delay so (click) on a result fires first
    setTimeout(() => this.searchFocused.set(false), 150);
  }

  navigateTo(item: SearchItem): void {
    this.router.navigate([item.route]);
    this.searchQuery.set('');
    this.searchFocused.set(false);
  }

  // ── User & Notifications ───────────────────────────────────────────────────
  getUserInitials(): string {
    const user = this.commonService.user();
    const name = user?.first_name || 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    this.showUserMenu.update((v) => !v);
    this.showNotifications.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update((v) => !v);
    this.showUserMenu.set(false);
  }

  markAllRead(): void {
    this.notifications.update((list) =>
      list.map((n) => ({ ...n, read: true })),
    );
    this.unreadCount.set(0);
  }

  signOut(): void {
    this.commonService.signOut();
  }
}
