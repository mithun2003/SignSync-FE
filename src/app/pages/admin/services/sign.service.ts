import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { ApiService } from '@core/services/api/api.service';

export interface ASLSign {
  id: number;
  character: string;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  file_size?: number;
  width?: number;
  height?: number;
  mime_type?: string;
  version: number;
  updated_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CloudinaryImage {
  public_id: string;
  url: string;
  file_size: number;
  width: number;
  height: number;
  mime_type: string;
  created_at?: string;
}

export interface SignStats {
  total_signs: number;
  missing_signs: number;
  missing_characters: string[];
  completion_percentage: number;
}

export interface BulkUploadResult {
  uploaded: BulkUploadedItem[];
  skipped: BulkSkippedItem[];
}

export interface BulkUploadedItem {
  filename: string;
  character: string;
  sign: ASLSign;
}

export interface BulkSkippedItem {
  filename: string;
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  private apiUrl = `admin/signs`;
  private publicApiUrl = `signs`;

  private cloudinaryCloudName = environment.cloudinaryCloudName;

  // ─────────────────────────────────────────────
  // PUBLIC API (no auth required)
  // ─────────────────────────────────────────────

  /** GET /api/v1/signs — returns all active signs with Cloudinary URLs */
  getPublicSigns(): Observable<ASLSign[]> {
    return this.apiService.get<ASLSign[]>(this.publicApiUrl);
  }

  // ─────────────────────────────────────────────
  // BACKEND API CALLS
  // ─────────────────────────────────────────────

  /** GET /api/v1/admin/signs */
  async getAllSigns(): Promise<{
    data: ASLSign[];
    total: number;
    missing_characters: string[];
  }> {
    return firstValueFrom(
      this.apiService.get<{
        data: ASLSign[];
        total: number;
        missing_characters: string[];
      }>(this.apiUrl),
    );
  }

  /** GET /api/v1/admin/signs/stats */
  async getStats(): Promise<SignStats> {
    return firstValueFrom(
      this.apiService.get<SignStats>(`${this.apiUrl}/stats`),
    );
  }

  /** GET /api/v1/admin/signs/{character}/images */
  async listCloudinaryImages(character: string): Promise<CloudinaryImage[]> {
    try {
      return await firstValueFrom(
        this.apiService.get<CloudinaryImage[]>(
          `${this.apiUrl}/${character}/images`,
        ),
      );
    } catch (error) {
      console.error('Failed to load Cloudinary images:', error);
      return [];
    }
  }

  /** POST /api/v1/admin/signs/{character}/upload */
  async uploadSign(character: string, file: File | Blob): Promise<ASLSign> {
    const formData = new FormData();
    formData.append('file', file);

    return firstValueFrom(
      this.apiService.post<ASLSign>(
        `${this.apiUrl}/${character}/upload`,
        formData,
      ),
    );
  }

  /** POST /api/v1/admin/signs/bulk-upload */
  async bulkUploadSigns(files: File[]): Promise<BulkUploadResult> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    return firstValueFrom(
      this.apiService.post<BulkUploadResult>(
        `${this.apiUrl}/bulk-upload`,
        formData,
      ),
    );
  }

  /** PUT /api/v1/admin/signs/{character}/set-active */
  async setActiveImage(
    character: string,
    publicId: string,
    notes?: string,
  ): Promise<ASLSign> {
    return firstValueFrom(
      this.apiService.put<ASLSign>(`${this.apiUrl}/${character}/set-active`, {
        cloudinary_public_id: publicId,
        notes,
      }),
    );
  }

  /** DELETE /api/v1/admin/signs/{character} */
  async deleteSign(character: string): Promise<void> {
    return firstValueFrom(
      this.apiService.delete<void>(`${this.apiUrl}/${character}`),
    );
  }

  /** POST /api/v1/admin/signs/character/{character}/update-url (legacy) */
  async updateSignUrl(
    character: string,
    cloudinaryUrl: string,
    notes?: string,
  ): Promise<ASLSign> {
    return firstValueFrom(
      this.apiService.post<ASLSign>(
        `${this.apiUrl}/character/${character}/update-url`,
        { cloudinary_url: cloudinaryUrl, notes },
      ),
    );
  }

  // ─────────────────────────────────────────────
  // CLOUDINARY URL HELPERS
  // ─────────────────────────────────────────────

  getOptimizedUrl(publicId: string, width = 400, height = 400): string {
    return `https://res.cloudinary.com/${this.cloudinaryCloudName}/image/upload/w_${width},h_${height},c_limit,q_auto,f_auto/${publicId}`;
  }

  getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, 200, 200);
  }
}
