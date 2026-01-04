import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from '@core/interceptor/authInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    provideHttpClient(withFetch(), withInterceptorsFromDi()),

    // provideClientHydration(withEventReplay()),
    // provideClientHydration(),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
