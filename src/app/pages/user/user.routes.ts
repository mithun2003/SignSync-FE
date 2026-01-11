import { Routes } from '@angular/router';
import { GestureDetectionComponent } from './components/gesture-detection/gesture-detection.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
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
];
