import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '@components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '@components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  showMobileMenu = signal(false);
  sidebarCollapsed = signal(localStorage.getItem('admin-sidebar-collapsed') === 'true');

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}