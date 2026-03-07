import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { ApiService } from '@core/services/api/api.service';

export interface ASLSign {
  id: number;
  character: string;
  cloudinary_url: string;
  version: number;
  updated_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export interface SignStats {
  total_signs: number;
  missing_signs: number;
  missing_characters: string[];
  completion_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignService {

  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  /**
   * Backend Admin API Base
   * Example:
   * http://localhost:8000/api/v1/admin/signs
   */
  private apiUrl = `admin/signs`;

  /**
   * Cloudinary config
   */
  private cloudinaryCloudName = environment.cloudinaryCloudName;
  private cloudinaryUploadPreset = environment.cloudinaryUploadPreset;


  // ─────────────────────────────────────────────
  // BACKEND API CALLS
  // ─────────────────────────────────────────────

  /**
   * GET /api/v1/admin/signs
   */
  async getAllSigns(): Promise<{ data: ASLSign[]; total: number; missing_characters: string[] }> {
    return firstValueFrom(
      this.apiService.get<{ data: ASLSign[]; total: number; missing_characters: string[] }>(
        this.apiUrl
      )
    );
  }

  /**
   * POST /api/v1/admin/signs/character/{character}/update-url
   */
  async updateSignUrl(
    character: string,
    cloudinaryUrl: string,
    notes?: string
  ): Promise<ASLSign> {

    return firstValueFrom(
      this.apiService.post<ASLSign>(
        `${this.apiUrl}/character/${character}/update-url`,
        {
          cloudinary_url: cloudinaryUrl,
          notes
        }
      )
    );
  }

  /**
   * GET /api/v1/admin/signs/stats
   */
  async getStats(): Promise<SignStats> {

    return firstValueFrom(
      this.apiService.get<SignStats>(
        `${this.apiUrl}/stats`
      )
    );
  }


  // ─────────────────────────────────────────────
  // CLOUDINARY OPERATIONS (Frontend)
  // ─────────────────────────────────────────────

  /**
   * List images for a character
   */
async listCloudinaryImages(character: string): Promise<CloudinaryImage[]> {

  try {

    const response = await fetch(
      `${environment.rootUrl}/api/v1/admin/signs/cloudinary-images/${character}`
    );

    if (!response.ok) return [];

    const data = await response.json();

    return data || [];

  } catch (error) {

    console.error('Failed to load Cloudinary images:', error);

    return [];
  }
}


  /**
   * Upload to Cloudinary
   */
  async uploadToCloudinary(
    file: File | Blob,
    character: string
  ): Promise<CloudinaryImage> {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', this.cloudinaryUploadPreset);

    formData.append('folder', `asl-signs/${character}`);
    formData.append('public_id', `${Date.now()}`);

    formData.append('tags', `character_${character},asl-sign`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();

    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      created_at: data.created_at
    };
  }


  /**
   * Optimized URL
   */
  getOptimizedUrl(publicId: string, width = 400, height = 400): string {

    return `https://res.cloudinary.com/${this.cloudinaryCloudName}/image/upload/w_${width},h_${height},c_limit,q_auto,f_auto/${publicId}`;
  }


  /**
   * Thumbnail
   */
  getThumbnailUrl(publicId: string): string {

    return this.getOptimizedUrl(publicId, 200, 200);
  }

}