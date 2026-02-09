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

// ---------------- SKELETON DRAWING LOGIC ----------------
  private performCanvasCrop(
    source: HTMLVideoElement,
    landmarks: NormalizedLandmark[],
  ): string | null {
    // 1. Calculate Bounding Box (To center the skeleton)
    const xs = landmarks.map((l) => l.x);
    const ys = landmarks.map((l) => l.y);
    
    const pad = 0.1;
    const minX = Math.max(0, Math.min(...xs) - pad);
    const minY = Math.max(0, Math.min(...ys) - pad);
    const maxX = Math.min(1, Math.max(...xs) + pad);
    const maxY = Math.min(1, Math.max(...ys) + pad);

    const widthNorm = maxX - minX;
    const heightNorm = maxY - minY;

    if (widthNorm < 0.05 || heightNorm < 0.05) return null;

    // 2. Setup Black Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d')!;

    // Fill Background with Black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 224, 224);

    // 3. Helper to Map Normalized Coords (0-1) to Canvas Coords (0-224)
    // We shift by minX/minY to center the hand in the box
    const toX = (val: number) => ((val - minX) / widthNorm) * 224;
    const toY = (val: number) => ((val - minY) / heightNorm) * 224;

    // 4. Draw Connections (White Lines)
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

    // 5. Draw Landmarks (White Dots)
    ctx.fillStyle = 'white';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(toX(lm.x), toY(lm.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    // return canvas.toDataURL('image/png');
    const dataUrl = canvas.toDataURL('image/png');

    // ---------------- DEBUGGING START ----------------
    // UNCOMMENT THIS to see the image in a new tab!

    console.log('🔍 Generated Crop:', dataUrl);

    // Or even better, open it directly (be careful, this opens many tabs if in a loop!)
    // const win = window.open();
    // win?.document.write('<img src="' + dataUrl + '"/>');
    // ---------------- DEBUGGING END ------------------

    return dataUrl;
  }


}
