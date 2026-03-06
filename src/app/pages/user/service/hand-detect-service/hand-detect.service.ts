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

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17]                                 // Palm Base
];

@Injectable({ providedIn: 'root' })
export class HandDetectService {
  handLandmarker?: HandLandmarker;

  private _isReady = signal(false);
  readonly isReady = this._isReady.asReadonly();

  // FPS protection (~12 FPS max)
  private lastProcessTs = 0;
  private readonly MIN_INTERVAL_MS = 80;

  // Persistent 224×224 canvas reused every frame (avoids per-frame DOM allocation)
  private cropCanvas: HTMLCanvasElement | null = null;
  private cropCtx: CanvasRenderingContext2D | null = null;

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

// ---------------- SKELETON DRAWING LOGIC ----------------
  private performCanvasCrop(
    _source: HTMLVideoElement,
    landmarks: NormalizedLandmark[],
  ): string | null {
    // 1. Calculate bounding box using a loop (avoids spread allocation)
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    for (const l of landmarks) {
      if (l.x < minX) minX = l.x;
      if (l.y < minY) minY = l.y;
      if (l.x > maxX) maxX = l.x;
      if (l.y > maxY) maxY = l.y;
    }

    const pad = 0.1;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(1, maxX + pad);
    maxY = Math.min(1, maxY + pad);

    const widthNorm = maxX - minX;
    const heightNorm = maxY - minY;
    if (widthNorm < 0.05 || heightNorm < 0.05) return null;

    // 2. Reuse persistent canvas (avoids per-frame DOM allocation)
    if (!this.cropCanvas) {
      this.cropCanvas = document.createElement('canvas');
      this.cropCanvas.width = 224;
      this.cropCanvas.height = 224;
      this.cropCtx = this.cropCanvas.getContext('2d');
    }
    const ctx = this.cropCtx;
    if (!ctx) return null;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 224, 224);

    // 3. Map normalized coords to canvas coords
    const toX = (val: number) => ((val - minX) / widthNorm) * 224;
    const toY = (val: number) => ((val - minY) / heightNorm) * 224;

    // 4. Draw connections (white lines)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [start, end] of HAND_CONNECTIONS) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(toX(p1.x), toY(p1.y));
      ctx.lineTo(toX(p2.x), toY(p2.y));
      ctx.stroke();
    }

    // 5. Draw landmark dots (white)
    ctx.fillStyle = 'white';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(toX(lm.x), toY(lm.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // JPEG is 5-10× faster to encode than PNG and produces a much smaller payload
    return this.cropCanvas.toDataURL('image/jpeg', 0.85);
  }
}
