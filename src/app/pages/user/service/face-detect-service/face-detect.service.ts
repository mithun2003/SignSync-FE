import { Injectable, signal } from '@angular/core';
import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult,
  Category,
} from '@mediapipe/tasks-vision';

@Injectable({ providedIn: 'root' })
export class FaceDetectService {
  faceLandmarker?: FaceLandmarker;
  private _isReady = signal(false);
  readonly isReady = this._isReady.asReadonly();

  // Throttle face detection — 200ms is plenty for mood display
  private lastDetectionTs = 0;
  private readonly MIN_FACE_INTERVAL_MS = 200;

  // Load Model
  async preloadModel() {
    if (this._isReady()) return;

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    this._isReady.set(true);
    console.log('[FaceDetectService] Model ready');
  }

  // Detect Face & Calculate Emotion
  detectEmotion(
    video: HTMLVideoElement,
    timestamp: number,
  ): {
    emotion: string;
    score: number;
  } | null {
    if (!this.faceLandmarker || !this._isReady()) return null;

    // Skip frame if not enough time has elapsed (avoids running heavy ML every rAF)
    if (timestamp - this.lastDetectionTs < this.MIN_FACE_INTERVAL_MS)
      return null;
    this.lastDetectionTs = timestamp;

    let result: FaceLandmarkerResult;
    try {
      result = this.faceLandmarker.detectForVideo(video, timestamp);
    } catch (err) {
      // Transient WebGL errors on first call — skip this frame, recover next call
      console.warn('[FaceDetectService] detectForVideo skipped frame:', err);
      return null;
    }

    if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
      // The first face's blendshapes
      const shapes = result.faceBlendshapes[0].categories;
      return this.classifyEmotion(shapes);
    }
    return null;
  }

  // 🔥 The Logic: Map Muscle Movements to Emotions
  private classifyEmotion(shapes: Category[]): {
    emotion: string;
    score: number;
  } {
    // Helper to find score of a specific movement
    const getScore = (name: string) =>
      shapes.find((s) => s.categoryName === name)?.score || 0;

    // 1. Happy (Smile)
    const smile =
      (getScore('mouthSmileLeft') + getScore('mouthSmileRight')) / 2;

    // 2. Surprised (Raised Eyebrows + Open Mouth)
    const surprise = (getScore('browInnerUp') + getScore('jawOpen')) / 2;

    // 3. Angry (Frown + Brow Down)
    const frown =
      (getScore('mouthFrownLeft') + getScore('mouthFrownRight')) / 2;
    const browDown = (getScore('browDownLeft') + getScore('browDownRight')) / 2;
    const anger = (frown + browDown) / 2;

    // 4. Sad (Mouth corners down + Inner brow raised)
    const sad = (frown + getScore('browInnerUp')) / 2;

    // Compare scores to find the dominant emotion
    const emotions = [
      { label: 'Happy 😄', score: smile },
      { label: 'Surprised 😲', score: surprise },
      { label: 'Angry 😠', score: anger },
      { label: 'Sad 😢', score: sad },
    ];

    // Find highest scoring emotion
    // Threshold: If all are low, assume "Neutral"
    const dominant = emotions.reduce((prev, current) =>
      current.score > prev.score ? current : prev,
    );

    if (dominant.score > 0.4) {
      return { emotion: dominant.label, score: dominant.score };
    } else {
      return { emotion: 'Neutral 😐', score: 0 };
    }
  }
}
