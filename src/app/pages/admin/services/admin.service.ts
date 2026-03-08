// admin.service.ts
import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { IApiRes } from '@models/global.model';
import {
  IActiveUsersData,
  IAdminDashboard,
  IAdminSettings,
  IAdminUser,
  IAdminUsersData,
  IBackupInfo,
  ICacheClearResult,
  ISystemHealth,
  IUserAnalyticsData,
} from '../models/admin.model';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiService = inject(ApiService);

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(): Observable<IApiRes<IAdminDashboard>> {
    return this.apiService.get('admin/dashboard');
  }

  exportReport(): Observable<Blob> {
    return this.apiService.getBlob('admin/dashboard/export');
  }

  getSystemLogs(page = 1): Observable<IApiRes> {
    return this.apiService.get(`admin/logs?page=${page}`);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  /** GET /admin/users — server-side search, filter, pagination */
  getAllUsers(
    search = '',
    status = 'all',
    page = 1,
    limit = 10,
  ): Observable<IAdminUsersData> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (status && status !== 'all') params = params.set('status', status);
    return this.apiService.get('admin/users', params);
  }

  /** PATCH /admin/users/{id}/status */
  updateUserStatus(
    userId: number,
    status: IAdminUser['status'],
  ): Observable<IApiRes<IAdminUser>> {
    return this.apiService.patch(`admin/users/${userId}/status`, { status });
  }

  /** DELETE /admin/users/{id} */
  deleteUser(userId: number): Observable<IApiRes<{ deleted: boolean }>> {
    return this.apiService.delete(`admin/users/${userId}`);
  }

  // ── Analytics ──────────────────────────────────────────────────────────────
  /** GET /admin/analytics/users?period=7|30|90 */
  getAnalytics(period: 7 | 30 | 90): Observable<{ data: IUserAnalyticsData }> {
    const params = new HttpParams().set('period', period.toString());
    return this.apiService.get('admin/analytics/users', params);
  }

  // ── System Health & Backup ─────────────────────────────────────────────────
  /** GET /admin/system/health */
  getSystemHealth(): Observable<{ data: ISystemHealth }> {
    return this.apiService.get('admin/system/health');
  }

  /** GET /admin/system/active-users?hours=24 */
  getActiveUsers(hours = 24): Observable<IActiveUsersData> {
    const params = new HttpParams().set('hours', hours.toString());
    return this.apiService.get('admin/system/active-users', params);
  }

  /** GET /admin/system/backup/info */
  getBackupInfo(): Observable<IBackupInfo> {
    return this.apiService.get('admin/system/backup/info');
  }

  /** POST /admin/system/backup */
  createBackup(): Observable<IBackupInfo> {
    return this.apiService.post('admin/system/backup', {});
  }

  /** POST /admin/system/cache/clear */
  clearCache(): Observable<ICacheClearResult> {
    return this.apiService.post('admin/system/cache/clear', {});
  }

  /** GET /admin/settings */
  getSettings(): Observable<IAdminSettings> {
    return this.apiService.get('admin/settings');
  }

  /** PATCH /admin/settings */
  updateSettings(updates: Partial<IAdminSettings>): Observable<IAdminSettings> {
    return this.apiService.patch('admin/settings', updates);
  }
}
