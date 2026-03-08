import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignManagementComponent } from './components/sign-management/sign-management.component';
import { ProfileComponent } from '@pages/profile/profile.component';
import { roleGuard } from '@core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { title: 'Dashboard' },
  },
  {
    path: 'signs',
    component: SignManagementComponent,
    data: { title: 'Signs' },
  },
  {
    path: 'todos',
    loadComponent: () =>
      import('./components/todos/todos.component').then(
        (m) => m.TodosComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users.component').then(
        (m) => m.UsersComponent,
      ),
    data: { title: 'Users' },
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./components/analytics/analytics.component').then(
        (m) => m.AnalyticsComponent,
      ),
    data: { title: 'Analytics' },
  },
  {
    path: 'backup',
    loadComponent: () =>
      import('./components/backup/backup.component').then(
        (m) => m.BackupComponent,
      ),
    data: { title: 'Backup & System' },
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('@pages/profile/change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent,
      ),
    data: { title: 'Change Password' },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [roleGuard],
    data: { title: 'Profile', isAdmin: true },
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
