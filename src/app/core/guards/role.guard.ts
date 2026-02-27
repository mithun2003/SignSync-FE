// role.guard.ts - ENHANCED VERSION
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  const token = localStorageService.getItem('accessToken');
  const userRole = localStorageService.getItem('userRole'); // 'admin' | 'user'

  // ❌ Not logged in at all
  if (!token) {
    // Redirect to signin with return URL
    return router.createUrlTree(['/auth/signin'], {
      queryParams: { returnUrl: state.url }
    });
  }

  // ✅ Check if trying to access admin routes
  if (state.url.startsWith('/admin')) {
    if (userRole !== 'admin') {
      // Not an admin, redirect to home
      return router.createUrlTree(['/']);
    }
    return true; // Is admin, allow access
  }

  // ✅ For user routes (dashboard, profile, settings)
  // Just need to be logged in (any role)
  return true;
};