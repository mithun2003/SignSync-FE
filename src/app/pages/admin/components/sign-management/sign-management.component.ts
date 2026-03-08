// admin/pages/sign-management/sign-management.component.ts

import {
  Component,
  OnInit,
  signal,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy,
  computed,
} from '@angular/core';
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
  faLayerGroup,
  faExclamationTriangle,
  faTrash,
} from '@fortawesome/pro-regular-svg-icons';
import {
  SignService,
  ASLSign,
  CloudinaryImage,
  SignStats,
  BulkUploadResult,
} from '@pages/admin/services/sign.service';

type ModalMode = 'select' | 'upload' | 'capture';

@Component({
  selector: 'app-sign-management',
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
  faLayerGroup = faLayerGroup;
  faExclamationTriangle = faExclamationTriangle;
  faTrash = faTrash;

  // View children
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bulkFileInput') bulkFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  // State
  activeSigns = signal<Map<string, ASLSign>>(new Map());
  stats = signal<SignStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Single-character modal state
  showModal = signal(false);
  modalMode = signal<ModalMode>('select');
  selectedCharacter = signal<string | null>(null);
  cloudinaryImages = signal<CloudinaryImage[]>([]);
  loadingImages = signal(false);
  isCapturing = signal(false);
  previewImage = signal<string | null>(null);
  uploadNotes = signal('');

  // Bulk upload state
  showBulkModal = signal(false);
  bulkFiles = signal<File[]>([]);
  bulkUploading = signal(false);
  bulkResult = signal<BulkUploadResult | null>(null);
  bulkError = signal<string | null>(null);

  isDeleting = signal(false);

  readonly bulkFilesMapped = computed(() =>
    this.bulkFiles().map((f) => ({
      file: f,
      character: this.detectCharacter(f.name),
    })),
  );

  mediaStream: MediaStream | null = null;

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  specialChars = ['SPACE'];

  ngOnInit() {
    this.loadActiveSigns();
    this.loadStats();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  async loadActiveSigns() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.signService.getAllSigns();
      const signsMap = new Map<string, ASLSign>();
      response.data.forEach((sign) => signsMap.set(sign.character, sign));
      this.activeSigns.set(signsMap);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'Failed to load signs',
      );
    } finally {
      this.loading.set(false);
    }
  }

  async loadStats() {
    try {
      const stats = await this.signService.getStats();
      this.stats.set(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  hasSign(character: string): boolean {
    return this.activeSigns().has(character);
  }

  getActiveSign(character: string): ASLSign | undefined {
    return this.activeSigns().get(character);
  }

  // ─── Single-character modal ───────────────────────────────────────────────

  async openCharacterModal(character: string) {
    this.selectedCharacter.set(character);
    this.showModal.set(true);
    this.modalMode.set('select');
    this.error.set(null);
    this.cloudinaryImages.set([]);
    await this.loadCloudinaryImages(character);
  }

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

  async selectCloudinaryImage(image: CloudinaryImage) {
    const character = this.selectedCharacter();
    if (!character) return;

    this.loading.set(true);
    try {
      await this.signService.setActiveImage(character, image.public_id);
      await this.loadActiveSigns();
      await this.loadStats();
      this.closeModal();
    } catch (err) {
      this.error.set('Failed to update sign');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  switchToUpload() {
    this.modalMode.set('upload');
    this.previewImage.set(null);
    setTimeout(() => this.fileInput?.nativeElement?.click(), 100);
  }

  async switchToCapture() {
    this.modalMode.set('capture');
    this.previewImage.set(null);
    await this.startCamera();
  }

  async startCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
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

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.isCapturing.set(false);
  }

  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          this.previewImage.set(URL.createObjectURL(blob));
          this.stopCamera();
          await this.uploadSignFile(blob);
        }
      },
      'image/jpeg',
      0.9,
    );
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => this.previewImage.set(e.target?.result as string);
    reader.readAsDataURL(file);

    await this.uploadSignFile(file);
  }

  async uploadSignFile(file: Blob | File) {
    const character = this.selectedCharacter();
    if (!character) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.signService.uploadSign(character, file);
      await this.loadActiveSigns();
      await this.loadStats();
      this.closeModal();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      this.loading.set(false);
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedCharacter.set(null);
    this.cloudinaryImages.set([]);
    this.previewImage.set(null);
    this.uploadNotes.set('');
    this.stopCamera();
    this.error.set(null);
  }

  async removeSign() {
    const character = this.selectedCharacter();
    if (!character || !this.hasSign(character)) return;

    const confirmed = confirm(
      `Remove the sign image for "${character}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    this.isDeleting.set(true);
    this.error.set(null);

    try {
      await this.signService.deleteSign(character);
      await this.loadActiveSigns();
      await this.loadStats();
      this.closeModal();
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'Failed to remove sign',
      );
    } finally {
      this.isDeleting.set(false);
    }
  }

  // ─── Bulk upload ──────────────────────────────────────────────────────────

  openBulkUpload() {
    this.showBulkModal.set(true);
    this.bulkFiles.set([]);
    this.bulkResult.set(null);
    this.bulkError.set(null);
  }

  closeBulkModal() {
    this.showBulkModal.set(false);
    this.bulkFiles.set([]);
    this.bulkResult.set(null);
    this.bulkError.set(null);
  }

  onBulkFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    this.bulkFiles.set(files);
    this.bulkResult.set(null);
    this.bulkError.set(null);
    input.value = '';
  }

  onBulkDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    this.bulkFiles.update((existing) => [...existing, ...files]);
    this.bulkResult.set(null);
    this.bulkError.set(null);
  }

  onBulkDragOver(event: DragEvent) {
    event.preventDefault();
  }

  removeBulkFile(index: number) {
    this.bulkFiles.update((files) => files.filter((_, i) => i !== index));
  }

  async executeBulkUpload() {
    const files = this.bulkFiles();
    if (files.length === 0) return;

    this.bulkUploading.set(true);
    this.bulkError.set(null);

    try {
      const result = await this.signService.bulkUploadSigns(files);
      this.bulkResult.set(result);
      if (result.uploaded.length > 0) {
        await this.loadActiveSigns();
        await this.loadStats();
      }
    } catch (err) {
      this.bulkError.set(
        err instanceof Error ? err.message : 'Bulk upload failed',
      );
    } finally {
      this.bulkUploading.set(false);
    }
  }

  /** Detect ASL character from filename (matches backend logic). */
  detectCharacter(filename: string): string | null {
    const stem = filename
      .replace(/\.[^.]+$/, '')
      .toUpperCase()
      .trim();
    const allowed = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'SPACE'];
    return allowed.includes(stem) ? stem : null;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
