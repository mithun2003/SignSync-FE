import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

import { HandDetectService } from '@pages/user/service/hand-detect.service';
import { UserService } from '@pages/user/service/user.service';
import { Subscription } from 'rxjs';
import { CommonService } from '@core/services/common/common.service';
import { RouterModule } from '@angular/router';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
    if (!this.handDetectService.isReady()) {
      this.feedbackText = 'Loading AI model...';
      await this.handDetectService.preloadModel();
      this.feedbackText = 'Click Start to begin';
    }
  });
  // constructor() {
  //   effect(() => {
  //     const res = this.userService.predictionResult();
  //     if (res) {
  //       this.isProcessingBackend = false;
  //     }
  //   });
  // }

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

    // 1. Get Landmarks & Crop
    // This is fast (runs locally in browser)
    const result = this.handDetectService.getHandCrop(video);
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

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

  ngOnDestroy(): void {
    this.stopRecording();
  }
}
