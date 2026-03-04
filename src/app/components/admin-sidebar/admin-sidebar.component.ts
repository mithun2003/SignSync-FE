// admin-sidebar.component.ts
import { NgOptimizedImage } from '@angular/common';
import {
  Component, EventEmitter, Output, Input,
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
  @Input() collapsed = false;
  @Output() mobileMenuClose = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  // Data
  readonly navSections: NavSection[] = NAV_SECTIONS;
  readonly quickActions: QuickAction[] = QUICK_ACTIONS;

  // System status signals
  systemHealth = signal(98);
  lastBackup = signal('2h ago');
  activeUsers = signal(47);

  // Actions
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
    localStorage.setItem('admin-sidebar-collapsed', String(this.collapsed));
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
    console.log('Creating backup...');
    // TODO: Call admin API
  }

  private clearCache(): void {
    console.log('Clearing cache...');
    // TODO: Call admin API
  }
}