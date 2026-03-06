import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { IApiRes } from '@models/global.model';
import {
  IDashboardResponse,
  IPredictResponse,
  IUserResponse,
  IUserUpdate,
} from '../../model/user.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';

// ✅ FIX B5: Backpressure constants
const MAX_WS_BUFFER = 1024 * 512; // 512KB — skip if buffer exceeds this
const MAX_PENDING = 2; // Max frames in flight

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);
  private localStorageService = inject(LocalStorageService)
  predictionResult = signal<IPredictResponse | null>(null);
  private socket?: WebSocket;
  private pendingFrames = 0; // ✅ FIX B5: Track in-flight frames

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const token = this.localStorageService.getItem('accessToken');

    if (!token) {
      console.error('[WS] No access token found');
      return;
    }

    this.socket = new WebSocket(
      `${environment.websocketUrl}/predict/ws?token=${token}`,
    );

    this.socket.onopen = () => {
      this.pendingFrames = 0;
      if (environment.isItDev) console.log('[WS] Connected');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        this.pendingFrames = Math.max(0, this.pendingFrames - 1);

        if (response.success && response.data) {
          this.predictionResult.set({
            label: response.data.label,
            confidence: response.data.confidence,
          });
        }
      } catch (error: unknown) {
        if (environment.isItDev) {
          console.warn('[WS] Failed to parse message', error);
        }
      } finally {
        this.pendingFrames = Math.max(0, this.pendingFrames - 1);
      }
    };

    this.socket.onerror = (err) => {
      if (environment.isItDev) console.error('[WS] Error', err);
    };

    this.socket.onclose = () => {
      this.pendingFrames = 0;
      if (environment.isItDev) console.log('[WS] Closed');
    };
  }

  sendImage(data: Blob | ArrayBuffer): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;

    // Backpressure — skip if too many frames in flight
    if (this.pendingFrames >= MAX_PENDING) return false;

    // Skip if browser WS buffer is too full
    if (this.socket.bufferedAmount > MAX_WS_BUFFER) return false;

    this.socket.send(data);
    this.pendingFrames++;
    return true;
  }

  disconnect(): void {
    if (this.socket) {
      // ✅ FIX B8: Null handlers BEFORE closing to prevent ghost callbacks
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onopen = null;
      this.socket.onclose = null;

      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }

      this.socket = undefined;
      this.pendingFrames = 0;
    }
  }

  predict(formData: FormData): void {
    this.apiService
      .post<IApiRes<IPredictResponse>>('predict', formData)
      .subscribe({
        next: (res: IApiRes<IPredictResponse>) => {
          if (res.status_code === 200) {
            this.predictionResult.set(res.data);
          }
        },
      });
  }

  // ── Profile Services ──
  updateProfile(data: IUserUpdate): Observable<IUserResponse> {
    return this.apiService.patch('user/me', data);
  }

  uploadProfileImage(file: File): Observable<IUserResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.apiService.post<IUserResponse>(
      'user/me/profile-image',
      formData,
    );
  }

  getProfile(): Observable<IUserResponse> {
    return this.apiService.get('user/me');
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.apiService.delete('user/me');
  }

  deleteProfileImage(): Observable<IUserResponse> {
    return this.apiService.delete('user/me/profile-image');
  }

  getDashboard(period: '7d' | '30d'): Observable<IApiRes<IDashboardResponse>> {
    return this.apiService.get(`dashboard?period=${period}`);
  }
}
