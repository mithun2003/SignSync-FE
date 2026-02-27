import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TranslateComponent } from './components/translate/translate.component';
import { roleGuard } from '@core/guards/role.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { GestureDetectionComponent } from './components/gesture-detection/gesture-detection.component';
import { HelpComponent } from './components/help/help.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';


export const routes: Routes = [
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Home',
    },
  },
  {
    path: 'gesture-detection',
    component: GestureDetectionComponent,
    data: {
      title: 'Detect Hand Gestures',
    },
  },
  {
    path: 'translate',
    component: TranslateComponent,
    data: {
      title: 'Translate',
    },
  },
  // ✅ Protected Routes (Require Login)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [roleGuard],
    data: {
      title: 'Dashboard',
    },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [roleGuard],
    data: {
      title: 'Profile',
    },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [roleGuard],
    data: {
      title: 'Settings',
    },
  },
  // ✅ Help is Public (No Guard)
  {
    path: 'help',
    component: HelpComponent,
    data: {
      title: 'Help & Support',
    },
  },
];