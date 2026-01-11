import {
  Component,
  signal,
  EventEmitter,
  Output,
  inject,
  ElementRef,
  Renderer2,
  PLATFORM_ID,
  Inject,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from 'app/shared/alert/service/alert.service';
import { faRightFromBracket } from '@fortawesome/pro-solid-svg-icons';

import { CommonService } from '@core/services/common/common.service';
import { IUserData } from '@models/global.model';
@Component({
  selector: 'app-admin-header',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent implements AfterViewInit, OnDestroy {
  private commonService = inject(CommonService);
  private alertService = inject(AlertService);
  subscriptions: Subscription[] = [];
  @Output() mobileMenuToggle = new EventEmitter<void>();

  // Signals for reactive state
  searchQuery = signal('');
  showUserMenu = signal(false);
  private documentClickListener: (() => void) | null = null;

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.documentClickListener = this.renderer.listen(
        'document',
        'click',
        (event: Event) => {
          // The dropdown menu
          const userMenuDropdown = this.elRef.nativeElement.querySelector(
            '.user-menu-dropdown',
          );
          // The button that toggles the menu
          const userMenuButton =
            this.elRef.nativeElement.querySelector('.user-menu-button');
          // If menu is open, and click is outside both the button and the dropdown, close it
          if (
            this.showUserMenu() &&
            userMenuDropdown &&
            userMenuButton &&
            !userMenuDropdown.contains(event.target) &&
            !userMenuButton.contains(event.target)
          ) {
            this.showUserMenu.set(false);
          }
        },
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  // Get current page name for breadcrumbs
  currentPage(): string {
    const path = this.router.url.split('/').pop();
    switch (path) {
      case 'dashboard':
        return 'Dashboard';
      case 'todos':
        return 'Todos';
      case 'users':
        return 'Users';
      case 'analytics':
        return 'Analytics';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      case 'logs':
        return 'System Logs';
      case 'backup':
        return 'Backup & Restore';
      default:
        return 'Dashboard';
    }
  }

  // Get user initials for avatar
  getUserInitials(): string {
    // const name = 'Admin User'; // Replace with actual user name
    const name = this.commonService.user()?.name || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit();
  }

  // Toggle user menu dropdown
  toggleUserMenu(): void {
    this.showUserMenu.update((show) => !show);
  }

  // Sign out functionality
  signOut(): void {
    // TODO: Implement sign out logic
    console.log('Sign out');
    this.subscriptions.push(
      this.alertService
        .alertMessage('confirm', {
          title: 'Confirm Logout',
          content: 'Are you sure you want to logout?',
          doneMsg: 'Logout',
          cancelMsg: 'Cancel',
          icon: faRightFromBracket,
          iconBgColor: 'red',
          iconClass: 'text-common-primary-red-color',
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) this.commonService.signOut();
        }),
    );
  }

  // Mock user data (replace with actual user service)
  user(): IUserData {
    const user = this.commonService.user();
    return {
      name: user?.name || 'Admin User',
      email: user?.email || 'admin@example.com',
      role: user?.role || 'admin',
      username: user?.username || 'admin',
      phone: user?.phone || 0,
      profile_photo: user?.profile_photo || null,
    };
  }
}
