// admin-layout.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '@components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '@components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  showMobileMenu = signal(false);
  sidebarCollapsed = signal(false);

  ngOnInit(): void {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') {
      this.sidebarCollapsed.set(true);
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  onSidebarCollapse(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}