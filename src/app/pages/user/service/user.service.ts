import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api/api.service';
import { IApiRes } from '@models/global.model';
import { IPredictResponse } from '../model/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiService = inject(ApiService);
  predict(formData: FormData): Observable<IApiRes<IPredictResponse>> {
    return this.apiService.post('user/predict-gesture', formData);
  }
}
