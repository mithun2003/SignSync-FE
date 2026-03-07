// admin.service.ts
import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { IApiRes } from '@models/global.model';
import { IAdminDashboard } from '../models/admin.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiService = inject(ApiService);

  getDashboard(): Observable<IApiRes<IAdminDashboard>> {
    return this.apiService.get('admin/dashboard');
  }

  exportReport(): Observable<Blob> {
    return this.apiService.getBlob('admin/dashboard/export');
  }

  getUsers(page = 1, limit = 20): Observable<IApiRes> {
    return this.apiService.get(`admin/users?page=${page}&limit=${limit}`);
  }

  getSystemLogs(page = 1): Observable<IApiRes> {
    return this.apiService.get(`admin/logs?page=${page}`);
  }
}