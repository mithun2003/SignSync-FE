import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepositoryService } from './auth-repository.service';
import { ILoginResponse } from '../model/auth.model';
import { IApiRes } from '@models/global.model';
import { ApiService } from '@core/services/api/api.service';
import { IUser } from '@models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authRepository = inject(AuthRepositoryService);
  private apiService = inject(ApiService);

  resetEmail = signal<string | undefined>(undefined);

  login(formData: FormData): Observable<IApiRes<ILoginResponse>> {
    return this.apiService.post('auth/login',formData);
  }
  // login(formData: FormData): Observable<IApiRes<ILoginResponse>> {
  //   return this.authRepository.login(formData);
  // }

    /**
     * To sign up a user using name, email and password.
     * @param body 
     * @returns 
     */
    signUp(body: IUser) {
      return this.apiService.post('auth/user', body);
    }
  

  forgotPassword(formData: FormData): Observable<ILoginResponse> {
    return this.authRepository.forgotPassword(formData);
  }

  otpVerify(formData: FormData): Observable<ILoginResponse> {
    return this.authRepository.otpVerify(formData);
  }

  resetPassword(formData: FormData): Observable<ILoginResponse> {
    return this.authRepository.resetPassword(formData);
  }
}
