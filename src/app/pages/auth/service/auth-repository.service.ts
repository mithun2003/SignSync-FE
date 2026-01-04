import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ILoginResponse } from '../model/auth.model';
import { IApiRes } from '@models/global.model';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryService {
  rootUrl = environment.rootUrl;

  private http = inject(HttpClient);

  login(formData: FormData): Observable<IApiRes<ILoginResponse>> {
    return this.http.post<IApiRes<ILoginResponse>>(
      `${this.rootUrl}/api/v1/auth/login/`,
      formData
    );
  }

  forgotPassword(formData: FormData): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(
      `${this.rootUrl}/api/accounts/forgot-password/`,
      formData
    );
  }

  otpVerify(formData: FormData): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(
      `${this.rootUrl}/api/accounts/reset-password-verify/`,
      formData
    );
  }

  resetPassword(formData: FormData): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(
      `${this.rootUrl}/api/accounts/reset-password/`,
      formData
    );
  }
}
