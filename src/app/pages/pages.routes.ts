import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { guestGuard } from '@core/guards/guest.guard';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout.component';
import { UserLayoutComponent } from '@layouts/user-layout/user-layout.component';
import { LegalComponent } from '@components/legal/legal.component';

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    // canActivate: [roleGuard], // ✅ changed
    loadChildren: () => import('./user/user.routes').then((m) => m.routes),
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [roleGuard], // ✅ changed
    loadChildren: () => import('./admin/admin.routes').then((m) => m.routes),
  },

  {
    path: 'legal/:section',
    component: LegalComponent,
    data: { title: 'Legal' },
  },
  // Redirect bare /legal to privacy
  {
    path: 'legal',
    redirectTo: 'legal/privacy',
    pathMatch: 'full',
  },

  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
