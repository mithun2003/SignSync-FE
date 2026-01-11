import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { IApiRes } from '@models/global.model';
import { IPredictResponse } from '../model/user.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);
  predictionResult = signal<IPredictResponse | null>(null);
  private socket?: WebSocket;

  // 🔥 Signal for live predictions

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(`${environment.websocketUrl}/predict/ws`);

    this.socket.onopen = () => {
      console.log('[WS] Connected');
    };

    this.socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log(response);
      console.log(response.data);
      if (response.success && response.data) {
        this.predictionResult.set({
          label: response.data.label,
          confidence: response.data.confidence,
        });
      }
    };

    this.socket.onerror = (err) => console.error('[WS] Error', err);

    this.socket.onclose = () => console.log('[WS] Closed');
  }

  sendImage(blob: Blob) {
    console.log('Send Image');
    console.log(this.socket?.readyState, WebSocket.OPEN);
    console.log(this.socket?.readyState !== WebSocket.OPEN);
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(blob);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
  }

  predict(formData: FormData) {
    this.apiService
      .post<IApiRes<IPredictResponse>>('predict', formData)
      .subscribe({
        next: (res: IApiRes<IPredictResponse>) => {
          if (res.status_code == 200) {
            this.predictionResult.set(res.data);
            console.log('Prediction Result:', res.data);
          }
        },
      });
  }
}
