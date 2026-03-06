// admin-sidebar.component.ts
import { NgOptimizedImage } from '@angular/common';
import {
  Component, input, output,
  signal, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NAV_SECTIONS, QUICK_ACTIONS,
  type NavSection, type QuickAction,
} from './admin-sidebar.data';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, FontAwesomeModule],
  templateUrl: './admin-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  collapsed = input<boolean>(false);
  mobileMenuClose = output<void>();
  collapsedChange = output<boolean>();

  // Data
  readonly navSections: NavSection[] = NAV_SECTIONS;
  readonly quickActions: QuickAction[] = QUICK_ACTIONS;

  // System status signals
  systemHealth = signal(98);
  lastBackup = signal('2h ago');
  activeUsers = signal(47);

  // Actions
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
    // TODO: Call admin API
  }

  private clearCache(): void {
    // TODO: Call admin API
  }
}