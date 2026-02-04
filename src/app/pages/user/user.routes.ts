import { Routes } from '@angular/router';
import { GestureDetectionComponent } from './components/gesture-detection/gesture-detection.component';
import { HomeComponent } from './components/home/home.component';
import { TranslateComponent } from './components/translate/translate.component';

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
];
