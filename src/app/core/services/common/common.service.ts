import { inject, Injectable, signal } from '@angular/core';
import { IApiRes, IUserData } from '@models/global.model';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private _user = signal<IUserData | null>(null);
  private apiService = inject(ApiService);
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private _loading = signal<boolean>(true); // 🔥 NEW

  user = this._user.asReadonly();
  loading = this._loading.asReadonly();

  setUser(user: IUserData | null) {
    this._user.set(user);
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
    this._loading.set(true)
    const token = this.localStorageService.getItem('accessToken');
    if (!token) {
      this._user.set(null);
      this._loading.set(false)
      return;
    }
    this.apiService.get<IApiRes<IUserData>>('user/me/').pipe(
      tap((user) => {
        console.log(user.data);
        
        this.setUser(user.data);
        this._loading.set(false)
      }),
      catchError(() => {
        this.setUser(null);
        this._loading.set(false);
        return of(null);
      }),
    ).subscribe();
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
}
