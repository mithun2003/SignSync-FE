import { Injectable, signal } from '@angular/core';
import {
  HandLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

/** Result returned for each valid frame */
export interface HandCropResult {
  landmarks: NormalizedLandmark[];
  crop: string | null;
}

@Injectable({ providedIn: 'root' })
export class HandDetectService {
  handLandmarker?: HandLandmarker;

  private _isReady = signal(false);
  readonly isReady = this._isReady.asReadonly();

  // Optional FPS protection (prevents accidental over-calling)
  private lastProcessTs = 0;
  private readonly MIN_INTERVAL_MS = 80; // ~12 FPS max

  // ---------------- MODEL LOAD ----------------
  async preloadModel() {
    if (this._isReady()) return;

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );

    const modelPath =
      'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: modelPath,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO', // ✅ REQUIRED for live video
      numHands: 1,
    });

    this._isReady.set(true);
    console.log('[HandDetectService] Model ready');
  }

  // ---------------- MAIN API ----------------
  /** Live video hand detection + crop */
  getHandCrop(video: HTMLVideoElement): HandCropResult | null {
    if (!this._isReady() || !this.handLandmarker) return null;

    // FPS guard
    const now = performance.now();
    if (now - this.lastProcessTs < this.MIN_INTERVAL_MS) return null;
    this.lastProcessTs = now;

    // Video readiness guard
    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    // Correct VIDEO-mode call
    const result = this.handLandmarker.detectForVideo(video, now);
    if (!result.landmarks || result.landmarks.length === 0) return null;

    const landmarks = result.landmarks[0];
    return {
      landmarks,
      crop: this.performCanvasCrop(video, landmarks),
    };
  }

  // ---------------- CROP LOGIC ----------------
  private performCanvasCrop(
    source: HTMLVideoElement,
    landmarks: NormalizedLandmark[],
  ): string | null {
    const xs = landmarks.map((l) => l.x);
    const ys = landmarks.map((l) => l.y);
    const pad = 0.15;
    const minX = Math.max(0, Math.min(...xs) - pad);
    const minY = Math.max(0, Math.min(...ys) - pad);
    const maxX = Math.min(1, Math.max(...xs) + pad);
    const maxY = Math.min(1, Math.max(...ys) + pad);
    const widthNorm = maxX - minX;
    const heightNorm = maxY - minY;
    // 🔒 ROI SAFETY (THIS PREVENTS THE CRASH)
    if (widthNorm <= 0 || heightNorm <= 0) return null;
    const MIN_SIZE = 0.05;
    // 5% of frame
    if (widthNorm < MIN_SIZE || heightNorm < MIN_SIZE) return null;
    const sw = source.videoWidth;
    const sh = source.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      source,
      minX * sw,
      minY * sh,
      widthNorm * sw,
      heightNorm * sh,
      0,
      0,
      224,
      224,
    );
    return canvas.toDataURL('image/png');
  }
}
