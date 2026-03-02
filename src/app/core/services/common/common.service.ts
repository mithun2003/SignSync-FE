import { inject, Injectable, signal } from '@angular/core';
import { IApiRes, IUserRead } from '@models/global.model';
import { tap, catchError, of, finalize } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AlertService } from 'app/shared/alert/service/alert.service';
import { faRightFromBracket } from '@fortawesome/pro-solid-svg-icons';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private apiService = inject(ApiService);
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  private _user = signal<IUserRead | null>(null);
  private _loading = signal<boolean>(true); // 🔥 NEW

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();

  setUser(user: IUserRead | null) {
    this._user.set(user);
  }

  clearUser(): void {
    this._user.set(null);
  }
  /**
   * To check if the user is signed in.
   * This will return the user details if the user is logged in.
   * @returns
   */
  isSignedIn() {
    return !!this._user();
  }

  /**
   * To get the current session of the user.
   * This will return the user details if the user is logged in.
   * @returns
   */
  getSession() {
    this._loading.set(true);
    const token = this.localStorageService.getItem('accessToken');
    if (!token) {
      this._user.set(null);
      this._loading.set(false);
      return;
    }
    this.apiService
      .get<IApiRes<IUserRead>>('user/me/')
      .pipe(
        tap((res) => {
          const updatedUser = {
            ...res.data,
            profile_image_url: this.buildImageUrl(res.data.profile_image_url),
          };
          console.log(updatedUser);
          this.setUser(updatedUser);
          this._loading.set(false);
        }),
        catchError(() => {
          this.setUser(null);
          this._loading.set(false);
          return of(null);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  /**
   * To sign out the user.
   * @returns
   */
  signOut() {
    this.apiService
      .post('auth/logout', {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.setUser(null);
        this.localStorageService.clearLocalStorage();
        this.router.navigate(['/auth/signin']);
      });
  }

  logout() {
    console.log('Sign out');
    // this.subscriptions.push(
    this.alertService
      .alertMessage('confirm', {
        title: 'Confirm Logout',
        content: 'Are you sure you want to logout?',
        doneMsg: 'Logout',
        cancelMsg: 'Cancel',
        icon: faRightFromBracket,
        iconBgColor: 'red',
        iconClass: 'text-common-primary-red-color',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) this.signOut();
      });
    // );
  }

  buildImageUrl(profileImageUrl: string | null): string {
    if (!profileImageUrl) return '';
    // Backend returns: /media/profile_images/xxx.jpg
    // We need:         http://localhost:8000/media/profile_images/xxx.jpg
    if (profileImageUrl.startsWith('/media/')) {
      return environment.rootUrl + profileImageUrl;
    }
    return profileImageUrl;
  }
}
