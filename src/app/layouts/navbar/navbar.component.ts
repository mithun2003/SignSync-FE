import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { INavItem, NAV_LINKS } from './nav-links.data';
import { NgOptimizedImage } from '@angular/common';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { CommonService } from '@core/services/common/common.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';
import { AlertService } from 'app/shared/alert/service/alert.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule,
    NgOptimizedImage,
    CommonButtonComponent,
    FontAwesomeModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly navLinks: INavItem[] = NAV_LINKS;
  readonly toggleCheckbox = viewChild.required<ElementRef<HTMLInputElement>>('toggleCheckbox');
  showUserMenu = signal<boolean>(false);

  commonService = inject(CommonService);
  alertService = inject(AlertService);

  faSpinner = faSpinner;

  // ✅ reactive
  readonly user = this.commonService.user;
  readonly isLoggedIn = computed(() => this.commonService.isSignedIn());

  closeMobileMenu() {
    const toggleCheckbox = this.toggleCheckbox();
    if (toggleCheckbox?.nativeElement) {
      toggleCheckbox.nativeElement.checked = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const header = document.querySelector('header');

    if (
      this.toggleCheckbox()?.nativeElement?.checked &&
      header &&
      !header.contains(target)
    ) {
      this.closeMobileMenu();
    }
  }

  // Toggle user menu dropdown
  toggleUserMenu(): void {
    this.showUserMenu.update((show: boolean) => !show);
  }

  logout() {

    this.commonService.logout();
  }
}
