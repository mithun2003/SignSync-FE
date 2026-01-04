import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);

  const token = localStorageService.getItem('accessToken');
  const userType = localStorageService.getItem('userRole');

  // Not logged in
  if (!token) {
    return router.createUrlTree(['/auth/signin']);
  }
  // Admin route
  if (state.url.startsWith('/admin') && userType !== 'admin') {
    return router.createUrlTree(['/']);
  }

  return true;
};
