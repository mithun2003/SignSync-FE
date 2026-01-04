import { inject, Injectable, signal } from '@angular/core';
import { IApiRes, IUserData } from '@models/global.model';
import { tap, catchError, of, Observable } from 'rxjs';
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

  user = this._user.asReadonly();

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
  getSession(): Observable<IApiRes<IUserData> | null> {
    const token = this.localStorageService.getItem('accessToken');
    if(!token){
      this._user.set(null);
      return of(null);
    }

    return this.apiService.get<IApiRes<IUserData>>('user/me/').pipe(
      tap((user) => {
        this.setUser(user.data);
      }),
      catchError(() => {
        this.setUser(null);
        return of(null);
      }),
    );
  }
  
  /**
   * To sign out the user.
   * @returns 
  */
 signOut() {
   this.apiService.post('auth/logout', {}).subscribe(() => {
     this.setUser(null);
     this.localStorageService.clearLocalStorage();
     this.router.navigate(['auth/signin']);
    });
  }
}