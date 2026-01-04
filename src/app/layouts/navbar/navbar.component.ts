import { ChangeDetectionStrategy, Component, ElementRef, HostListener, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { INavItem, NAV_LINKS } from './nav-links.data';
import {NgOptimizedImage} from '@angular/common';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    NgOptimizedImage,
    CommonButtonComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    protected readonly navLinks: INavItem[] = NAV_LINKS;
    readonly toggleCheckbox = viewChild.required<ElementRef<HTMLInputElement>>('toggleCheckbox');


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
}
