import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { INavItem, NAV_LINKS } from './nav-links.data';
import { NgOptimizedImage } from '@angular/common';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { CommonService } from '@core/services/common/common.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    NgOptimizedImage,
    CommonButtonComponent,
    FontAwesomeModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  // State
  isMenuOpen = signal(false);
  showUserMenu = signal(false);
  windowWidth = signal(window.innerWidth);

  // Data & Services
  protected readonly navLinks: INavItem[] = NAV_LINKS;
  commonService = inject(CommonService);
  faSpinner = faSpinner;

  // Computed
  readonly user = this.commonService.user;
  readonly isLoggedIn = computed(() => this.commonService.isSignedIn());
  readonly isLargeScreen = computed(() => this.windowWidth() >= 1024);


  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
    if (this.isLargeScreen()) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  closeMobileMenu() {
    this.isMenuOpen.set(false);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close mobile menu if clicking outside the navbar
    if (this.isMenuOpen() && !target.closest('header')) {
      this.closeMobileMenu();
    }
    // Close user dropdown if clicking outside
    if (this.showUserMenu() && !target.closest('.relative')) {
      this.showUserMenu.set(false);
    }
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
    this.closeMobileMenu();
  }

  // Update logout method
  logout() {
    this.commonService.logout();
    this.showUserMenu.set(false); // Add this line
  }
}
