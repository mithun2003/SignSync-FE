// admin/pages/sign-management/sign-management.component.ts
// Frontend-focused component with Cloudinary integration

import { Component, OnInit, signal, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUpload,
  faCamera,
  faCheck,
  faTimes,
  faSync,
  faImage,
  faCloudUploadAlt,
  faImages,
} from '@fortawesome/pro-regular-svg-icons';
import { SignService, ASLSign, CloudinaryImage, SignStats } from '@pages/admin/services/sign.service';

type ModalMode = 'select' | 'upload' | 'capture';

@Component({
  selector: 'app-sign-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './sign-management.component.html',
  styleUrls: ['./sign-management.component.css'],
})
export class SignManagementComponent implements OnInit, OnDestroy {
  private signService = inject(SignService);

  // Icons
  faUpload = faUpload;
  faCamera = faCamera;
  faCheck = faCheck;
  faTimes = faTimes;
  faSync = faSync;
  faImage = faImage;
  faCloudUploadAlt = faCloudUploadAlt;
  faImages = faImages;

  // View children
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  // State
  activeSigns = signal<Map<string, ASLSign>>(new Map());
  stats = signal<SignStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Modal state
  showModal = signal(false);
  modalMode = signal<ModalMode>('select');
  selectedCharacter = signal<string | null>(null);
  
  // Cloudinary images for selection
  cloudinaryImages = signal<CloudinaryImage[]>([]);
  loadingImages = signal(false);
  
  // Upload state
  isCapturing = signal(false);
  previewImage = signal<string | null>(null);
  uploadNotes = signal('');
  
  mediaStream: MediaStream | null = null;

  // Alphabet
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  specialChars = ['SPACE'];

  ngOnInit() {
    this.loadActiveSigns();
    this.loadStats();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  /**
   * Load all active signs from backend
   */
  async loadActiveSigns() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.signService.getAllSigns();
      
      const signsMap = new Map<string, ASLSign>();
      response.data.forEach(sign => {
        signsMap.set(sign.character, sign);
      });
      
      this.activeSigns.set(signsMap);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load signs');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Load statistics
   */
  async loadStats() {
    try {
      const stats = await this.signService.getStats();
      this.stats.set(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  /**
   * Check if character has sign
   */
  hasSign(character: string): boolean {
    return this.activeSigns().has(character);
  }

  /**
   * Get active sign for character
   */
  getActiveSign(character: string): ASLSign | undefined {
    return this.activeSigns().get(character);
  }

  /**
   * Open modal for character
   */
  async openCharacterModal(character: string) {
    this.selectedCharacter.set(character);
    this.showModal.set(true);
    this.modalMode.set('select');
    this.error.set(null);
    this.cloudinaryImages.set([]);
    
    // Load existing Cloudinary images
    await this.loadCloudinaryImages(character);
  }

  /**
   * Load Cloudinary images for character
   */
  async loadCloudinaryImages(character: string) {
    this.loadingImages.set(true);
    
    try {
      const images = await this.signService.listCloudinaryImages(character);
      this.cloudinaryImages.set(images);
    } catch (err) {
      console.error('Failed to load Cloudinary images:', err);
      this.cloudinaryImages.set([]);
    } finally {
      this.loadingImages.set(false);
    }
  }

  /**
   * Select existing Cloudinary image
   */
  async selectCloudinaryImage(image: CloudinaryImage) {
    const character = this.selectedCharacter();
    if (!character) return;

    this.loading.set(true);

    try {
      await this.signService.updateSignUrl(
        character,
        image.secure_url,
        `Selected from Cloudinary (${image.format}, ${this.formatBytes(image.bytes)})`
      );

      await this.loadActiveSigns();
      await this.loadStats();
      
      alert(`Sign ${character} updated successfully!`);
      this.closeModal();
      
    } catch (err) {
      this.error.set('Failed to update sign');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Switch to upload mode
   */
  switchToUpload() {
    this.modalMode.set('upload');
    this.previewImage.set(null);
    
    setTimeout(() => {
      this.fileInput?.nativeElement?.click();
    }, 100);
  }

  /**
   * Switch to capture mode
   */
  async switchToCapture() {
    this.modalMode.set('capture');
    this.previewImage.set(null);
    await this.startCamera();
  }

  /**
   * Start camera
   */
  async startCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
        await this.videoElement.nativeElement.play();
        this.isCapturing.set(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      this.error.set('Failed to access camera');
    }
  }

  /**
   * Stop camera
   */
  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCapturing.set(false);
  }

  /**
   * Capture photo
   */
  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const preview = URL.createObjectURL(blob);
        this.previewImage.set(preview);
        await this.uploadToCloudinary(blob);
      }
    }, 'image/jpeg', 0.9);

    this.stopCamera();
  }

  /**
   * Handle file selection
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImage.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await this.uploadToCloudinary(file);
  }

  /**
   * Upload to Cloudinary and update backend
   */
  async uploadToCloudinary(file: Blob | File) {
    const character = this.selectedCharacter();
    if (!character) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      // Upload to Cloudinary
      const cloudinaryResult = await this.signService.uploadToCloudinary(file, character);
      
      // Update backend with new URL
      await this.signService.updateSignUrl(
        character,
        cloudinaryResult.secure_url,
        this.uploadNotes() || `Uploaded (${cloudinaryResult.format}, ${this.formatBytes(cloudinaryResult.bytes)})`
      );

      await this.loadActiveSigns();
      await this.loadStats();
      
      alert(`Sign ${character} uploaded successfully!`);
      this.closeModal();
      
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    this.showModal.set(false);
    this.selectedCharacter.set(null);
    this.cloudinaryImages.set([]);
    this.previewImage.set(null);
    this.uploadNotes.set('');
    this.stopCamera();
  }

  /**
   * Format bytes
   */
  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Format date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}