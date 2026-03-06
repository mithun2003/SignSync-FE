import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignManagementComponent } from './components/sign-management/sign-management.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      title: 'Dashboard',
    },
  },
  {
    path: 'signs',
    component: SignManagementComponent,
    data: {
      title: 'Signs',
    },
  },
  {
    path: 'todos',
    loadComponent: () =>
      import('./components/todos/todos.component').then((m) => m.TodosComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
