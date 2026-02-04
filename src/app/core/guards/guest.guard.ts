// import { inject, PLATFORM_ID } from '@angular/core';
// import { CanMatchFn, Router } from '@angular/router';
// import { isPlatformBrowser } from '@angular/common';
// import { map } from 'rxjs';
// import { CommonService } from '@core/services/common/common.service';

/**
 * Prevents access to /auth routes if the user is already signed in.
 */
// export const guestGuard: CanMatchFn = (route, segments) => {
//   const commonService = inject(CommonService);
//   const router = inject(Router);
//   const platformId = inject(PLATFORM_ID);

//   if (isPlatformBrowser(platformId)) {
//     // If the user is already signed in, redirect to dashboard
//     if (commonService.isSignedIn()) {
//       return router.createUrlTree(['/admin']);
//     }
//     // If not signed in, allow access to auth routes
//     return commonService.getSession().pipe(
//       map(user => !user ? true : router.createUrlTree(['/admin']))
//     );
//   }
// };

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storage = inject(LocalStorageService);

  const token = storage.getItem('accessToken');
  const role = storage.getItem('userRole'); // 'admin' | 'user'

  if (!token) {
    return true; // allow auth pages
  }

  if (role === 'admin') {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/']);
};
