import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.rootUrl}/api/v1`;

  private jsonHeaders = new HttpHeaders({
    Accept: 'application/json',
  });

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.jsonHeaders,
      params,
      withCredentials: true,
    });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const isFormData = body instanceof FormData;

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: isFormData ? undefined : this.jsonHeaders,
      withCredentials: true,
    });
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.jsonHeaders,
      withCredentials: true,
    });
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: this.jsonHeaders,
      withCredentials: true,
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.jsonHeaders,
      withCredentials: true,
    });
  }
}
