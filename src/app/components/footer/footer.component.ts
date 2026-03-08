// footer.component.ts — COMPLETE FIXED VERSION
import {
  Component,
  HostListener,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  FaIconLibrary,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import {
  faGithub,
  faXTwitter,
  faLinkedinIn,
  faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import {
  faLock,
  faArrowUpRightFromSquare,
  faArrowUp,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription, filter, delay } from 'rxjs';
import { AlertService } from 'app/shared/alert/service/alert.service';

import {
  SOCIAL_LINKS,
  NAV_COLUMNS,
  LEGAL_LINKS,
  SocialLink,
  NavLink,
} from './footer.data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private library = inject(FaIconLibrary);
  private alertService = inject(AlertService);
  private routerSub?: Subscription;

  // Data
  readonly socialLinks = SOCIAL_LINKS;
  readonly navColumns = NAV_COLUMNS;
  readonly legalLinks = LEGAL_LINKS;

  // Icons (for template reference)
  readonly faLock = faLock;
  readonly faExternal = faArrowUpRightFromSquare;
  readonly faArrowUp = faArrowUp;
  readonly faSpinner = faSpinner;

  // State
  year = new Date().getFullYear();
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isSubscribing = signal(false);
  showScrollTop = signal(false);

  constructor() {
    // Register all FA icons
    this.library.addIcons(
      faGithub,
      faXTwitter,
      faLinkedinIn,
      faInstagram,
      faLock,
      faArrowUpRightFromSquare,
      faArrowUp,
      faSpinner,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ FIX #1: Fragment scroll handler
  // ═══════════════════════════════════════════════════════════════
  ngOnInit(): void {
    // Listen for navigation events to handle fragment scrolling
    this.routerSub = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        delay(100), // Wait for DOM to render
      )
      .subscribe(() => {
        const tree = this.router.parseUrl(this.router.url);
        const fragment = tree.fragment;
        if (fragment) {
          this.scrollToElement(fragment);
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  /**
   * Navigate to route + scroll to fragment
   * Called from template for fragment links
   */
  navigateWithFragment(link: NavLink): void {
    if (!link.route) return;

    if (link.fragment) {
      // If we're already on the target route, just scroll
      const currentPath = this.router.url.split('#')[0].split('?')[0];
      if (
        currentPath === link.route ||
        (currentPath === '/' && link.route === '/')
      ) {
        this.scrollToElement(link.fragment);
      } else {
        // Navigate to route, then scroll (handled by ngOnInit subscriber)
        this.router.navigate([link.route], { fragment: link.fragment });
      }
    } else {
      this.router.navigate([link.route]);
    }
  }

  /**
   * Scroll to element by ID with offset for fixed navbar
   */
  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      const navbarHeight = 80; // Adjust to your navbar height
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Social Links
  // ═══════════════════════════════════════════════════════════════
  openSocialLink(social: SocialLink): void {
    window.open(social.url, '_blank', 'noopener,noreferrer');
  }

  // ═══════════════════════════════════════════════════════════════
  // Newsletter
  // ═══════════════════════════════════════════════════════════════
  subscribe(): void {
    if (this.emailControl.invalid) return;
    this.isSubscribing.set(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      this.isSubscribing.set(false);
      this.emailControl.reset();
      this.alertService.alertMessage('success', {
        content: 'Subscribed successfully!',
        close: true,
        timeout: 3000,
      });
    }, 1500);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
