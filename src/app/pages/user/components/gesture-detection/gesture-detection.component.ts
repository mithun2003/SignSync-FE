import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

import { HandDetectService } from '@pages/user/service/hand-detect-service/hand-detect.service';
import { UserService } from '@pages/user/service/user-service/user.service';
import { Subscription } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
import { RouterModule } from '@angular/router';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaceDetectService } from '@pages/user/service/face-detect-service/face-detect.service';
import { EMOTION_WORD_MAP } from '@pages/user/service/face-detect-service/emotion-word-map';
import { speakText } from 'app/shared/utils/speech.util';

@Component({
  selector: 'app-gesture-detection',
  templateUrl: './gesture-detection.component.html',
  styleUrls: ['./gesture-detection.component.css'], // Don't forget this
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CommonButtonComponent,
    FontAwesomeModule,
  ],
})
export class GestureDetectionComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  public userService = inject(UserService);
  public handDetectService = inject(HandDetectService);
  public faceDetectService = inject(FaceDetectService);
  public commonService = inject(CommonService);

  isRecording = signal(false);
  readonly isLoggedIn = computed(() => this.commonService.isSignedIn());

  // UI Signals
  predictionLabel: string | null = null;
  confidence = 0;
  feedbackText = 'Click Start to begin';

  private mediaStream: MediaStream | null = null;
  private animationId?: number;
  private wsSubscription?: Subscription;
  faSpinner = faSpinner;

  currentMood = signal<string>('Neutral 😐');

  suggestedWords = signal<string[]>([]);
  private lastSpokenLabel: string | null = null;
  isSpeechEnabled = signal(true);
  // 🔥 FLOW CONTROL FLAG
  // This prevents the "20 second lag". We only send when we are free.
  private isProcessingBackend = false;
  getChanges = effect(async () => {
    const loggedIn = this.isLoggedIn();

    if (!loggedIn) {
      this.feedbackText = 'Login required to start detection';
      return;
    }

    // ✅ Runs exactly ONCE when user becomes available
    // if (!this.handDetectService.isReady()) {
    this.feedbackText = 'Loading AI model...';
    // await this.handDetectService.preloadModel();
    await Promise.all([
      this.handDetectService.preloadModel(),
      this.faceDetectService.preloadModel(),
    ]);
    this.feedbackText = 'Click Start to begin';
    // }
  });
  // constructor() {
  getProcess = effect(() => {
    const res = this.userService.predictionResult();
    if (res) {
      this.isProcessingBackend = false;
    }
  });
  // }
  normalizeEmotion(emotion: string): string {
    return emotion.split(' ')[0]; // "Happy 😄" → "Happy"
  }

  getWords = effect(() => {
    const letter = this.userService.predictionResult()?.label;
    const emotionRaw = this.currentMood();
    console.log('Detected Letter:', letter);
    console.log('Detected Emotion:', emotionRaw);

    if (!letter || !emotionRaw) {
      this.suggestedWords.set([]);
      return;
    }

    if (this.isSpeechEnabled()) {
      if (this.lastSpokenLabel === letter) return;

      this.lastSpokenLabel = letter;
      speakText(letter);
    }

    const emotion = this.normalizeEmotion(emotionRaw);
    console.log('Normalized Emotion:', emotion);

    const words =
      EMOTION_WORD_MAP[emotion]?.[letter] ??
      EMOTION_WORD_MAP['Neutral']?.[letter] ??
      [];

    console.log('Suggested Words:', words);

    this.suggestedWords.set(words);
  });
  // async ngOnInit() {
  //   // ✅ Check login FIRST

  //   // ❌ Do NOT preload model if not logged in
  //   if (!this.isLoggedIn()) {
  //     this.feedbackText = 'Login required to start detection';
  //     return;
  //   }

  //   // ✅ Only logged-in users load heavy model
  //   await this.handDetectService.preloadModel();
  // }

  // ================= START =================
  async startRecording() {
    if (!this.isLoggedIn()) {
      this.feedbackText = 'Please login to use live detection';
      return;
    }
    if (this.isRecording()) return;

    try {
      // 1. Connect WS
      this.userService.connect();

      // // 2. Listen for Backend Responses (To clear the processing flag)
      // // Assuming userService exposes an observable for messages
      // this.wsSubscription = this.userService.messages$.subscribe((res: any) => {
      //   this.isProcessingBackend = false; // ✅ UNLOCK: Backend is ready for next frame

      //   if (res.success && res.data) {
      //     this.predictionLabel = res.data.label;
      //     this.confidence = res.data.confidence;
      //   }
      // });

      // 1. Get Camera Stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }, // Keep resolution low for speed
      });

      // 2. Assign to Video Element IMMEDIATELY
      this.videoElement.nativeElement.srcObject = this.mediaStream;

      // 3. Force Play (Required for some browsers)
      await this.videoElement.nativeElement.play();

      // 4. Update UI State (Shows the "Live" badge)
      this.isRecording.set(true);
      this.feedbackText = 'Initializing AI...';

      // 5. 🔥 THE FIX: Wait 2 seconds before starting the heavy AI loop
      // This allows the video preview to show up INSTANTLY to the user.
      setTimeout(() => {
        this.feedbackText = 'Show hand...';
        this.isProcessingBackend = false;
        this.renderLoop(); // Start AI only after video is smooth
      }, 2000);
    } catch (err) {
      console.error(err);
      this.feedbackText = 'Camera denied';
    }
  }

  // ================= RENDER LOOP (The Core) =================
  private renderLoop() {
    if (!this.isLoggedIn() || !this.isRecording()) return;

    const video = this.videoElement.nativeElement;
    const now = performance.now();

    // 1. Get Landmarks & Crop
    // This is fast (runs locally in browser)
    const result = this.handDetectService.getHandCrop(video);
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // 2. FACE/EMOTION DETECTION (New Logic)
    // We pass 'now' timestamp required by FaceLandmarker
    const faceResult = this.faceDetectService.detectEmotion(video, now);
    if (faceResult) {
      this.currentMood.set(faceResult.emotion);
    }

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (result) {
      console.log(result.landmarks);

      // 2. Draw Landmarks (Real-time Visual Feedback)
      this.draw(ctx, result.landmarks);

      // 3. SMART SENDING LOGIC
      // Rule A: Must have hand crop
      // Rule B: Backend must be free (This fixes the 30s lag)
      if (result.crop && !this.isProcessingBackend) {
        // 🔒 LOCK: Don't send more until this one finishes
        this.isProcessingBackend = true;

        const blob = this.base64ToBlob(result.crop);
        this.userService.sendImage(blob);
      }
    } else {
      // No hand detected: Clear canvas
      this.clearCanvas();
    }

    // 4. Schedule next frame (Using RequestAnimationFrame for smooth drawing)
    this.animationId = requestAnimationFrame(() => this.renderLoop());
  }

  // ================= STOP =================
  stopRecording() {
    if (!this.isLoggedIn()) return;
    this.isRecording.set(false);

    if (this.animationId) cancelAnimationFrame(this.animationId);

    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.videoElement.nativeElement.srcObject = null;

    this.userService.disconnect();
    this.wsSubscription?.unsubscribe();

    this.clearCanvas();
    this.feedbackText = 'Stopped';
    this.predictionLabel = null;
  }

  // ================= UTILS =================
  // private draw(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]) {
  //   // Draw MediaPipe Visuals

  //   drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
  //     color: '#00FF00',
  //     lineWidth: 3,
  //   });

  //   drawLandmarks(ctx, landmarks, {
  //     color: '#FF0000',
  //     lineWidth: 1,
  //     radius: 3,
  //   });
  //   console.log('Drawn landmarks');

  // }

  private draw(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // 1. Draw Connections (Green Lines)
    ctx.save();
    ctx.strokeStyle = '#00FF00'; // Bright Green
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      ctx.beginPath();
      // Convert Normalized (0-1) to Pixel Coordinates
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Landmarks (Red Dots)
    ctx.fillStyle = '#FF0000'; // Red
    for (const lm of landmarks) {
      const x = lm.x * width;
      const y = lm.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI); // Radius 4
      ctx.fill();
    }

    // Debug: Prove we drew something
    // console.log(`Drawn frame on ${width}x${height}`);
  }

  private clearCanvas() {
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }

  @HostListener('document:visibilitychange')
  handleVisibilityChange() {
    if (document.hidden && this.isRecording()) {
      this.stopRecording();
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
  }
}
