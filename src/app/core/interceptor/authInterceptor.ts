import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

const AUTH_EXCLUDED_URLS = ['/auth/login', '/auth/signup', '/auth/refresh'];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private localStorageService = inject(LocalStorageService);
  private apiService = inject(ApiService);

  /**
   * Intercept HTTP requests and add authorization token if available.
   *
   * @param request - The outgoing HTTP request
   * @param next - The next HTTP handler
   * @returns An Observable of the HTTP event
   */
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.localStorageService.getItem('accessToken');
    const isAuthExcluded = AUTH_EXCLUDED_URLS.some((url) =>
      req.url.includes(url),
    );

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err.status !== 401 || isAuthExcluded || !token) {
          return throwError(() => err);
        }

        return this.apiService
          .post<{
            access_token: string;
            token_type: string;
          }>('auth/refresh', {})
          .pipe(
            switchMap((res) => {
              this.localStorageService.setItem(
                'accessToken',
                res?.access_token,
              );
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.access_token}`,
                },
              });
              return next.handle(retryReq);
            }),
            catchError((refreshErr) => {
              // 🔥 Refresh failed → force logout
              this.localStorageService.clearLocalStorage();
              return throwError(() => refreshErr);
            }),
          );
      }),
    );
  }
}
