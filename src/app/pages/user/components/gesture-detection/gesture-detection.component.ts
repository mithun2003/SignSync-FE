import { DecimalPipe } from '@angular/common';
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
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

import { CommonService } from '@core/services/common/common.service';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { speakText } from 'app/shared/utils/speech.util';

import { HandDetectService } from '@pages/user/service/hand-detect-service/hand-detect.service';
import { FaceDetectService } from '@pages/user/service/face-detect-service/face-detect.service';
import { EMOTION_WORD_MAP } from '@pages/user/service/face-detect-service/emotion-word-map';
import { UserService } from '@pages/user/service/user-service/user.service';

@Component({
  selector: 'app-gesture-detection',
  templateUrl: './gesture-detection.component.html',
  styleUrls: ['./gesture-detection.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    FontAwesomeModule,
    CommonButtonComponent,
  ],
})
export class GestureDetectionComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  // Services
  public handDetectService = inject(HandDetectService);
  public faceDetectService = inject(FaceDetectService);
  public userService = inject(UserService);
  public commonService = inject(CommonService);

  // Icons
  faSpinner = faSpinner;

  // State Signals
  isRecording = signal(false);
  readonly isLoggedIn = computed(() => this.commonService.isSignedIn());

  // Sentence Building
  sentenceBuffer = signal<string[]>([]);
  letterHistory = signal<string[]>([]);

  // Current Detection
  currentLetter = signal<string>('');
  currentConfidence = signal<number>(0);

  // Emotion & Suggestions
  currentMood = signal<string>('Neutral 😐');
  suggestedWords = signal<string[]>([]);

  // Settings
  autoSpace = signal(true);
  isSpeechEnabled = signal(true);

  feedbackText = signal<string>('Click Start to begin');

  // Stats
  letterCount = computed(
    () => this.sentenceBuffer().filter((c) => c !== ' ').length,
  );
  wordCount = computed(
    () =>
      this.sentenceBuffer()
        .join('')
        .trim()
        .split(/\s+/)
        .filter((w) => w).length,
  );
  timeSinceLastLetter = signal<string>('--');

  // Internal State
  private mediaStream: MediaStream | null = null;
  private animationId?: number;
  private isProcessingBackend = false;
  private lastLandmarks: NormalizedLandmark[] | null = null;
  private missingFrames = 0;
  private readonly MAX_MISSING_FRAMES = 5;

  private canvasCtx: CanvasRenderingContext2D | null = null;

  // Letter Detection Logic
  private lastDetectedLetter: string | null = null;
  private lastLetterTime = 0;
  private letterStability = signal(0);
  private readonly STABILITY_THRESHOLD = 5;
  private readonly MIN_LETTER_INTERVAL = 800;
  private readonly AUTO_SPACE_TIMEOUT = 2000;

  private lastLetterTimestamp = 0;
  private spaceTimerHandle?: ReturnType<typeof setTimeout>;

  private tickIntervalId?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      const loggedIn = this.isLoggedIn();
      if (!loggedIn) {
        this.feedbackText.set('Login required to start detection');
        return;
      }
      this.feedbackText.set('Loading AI models...');
      this.loadModels();
    });

    // Process predictions from backend
    effect(() => {
      const result = this.userService.predictionResult();
      if (!result) return;

      this.isProcessingBackend = false;

      if (
        !result.label ||
        result.label === 'error' ||
        result.label === 'no_hand'
      ) {
        if (result.label === 'no_hand') {
          this.feedbackText.set('Show hand to camera');
        }
        this.resetLetterDetection();
        this.suggestedWords.set([]);
        return;
      }

      if (result.label === 'uncertain') {
        this.feedbackText.set('Hold steady...');
        return;
      }

      this.processLetter(result.label, result.confidence);
      this.updateSuggestedWords(result.label);
    });

    this.tickIntervalId = setInterval(() => {
      if (this.lastLetterTimestamp > 0) {
        const elapsed = Date.now() - this.lastLetterTimestamp;
        if (elapsed < 1000) {
          this.timeSinceLastLetter.set('just now');
        } else if (elapsed < 60000) {
          this.timeSinceLastLetter.set(`${Math.floor(elapsed / 1000)}s ago`);
        } else {
          this.timeSinceLastLetter.set('--');
        }
      }
    }, 1000);
  }

  private async loadModels(): Promise<void> {
    try {
      await Promise.all([
        this.handDetectService.preloadModel(),
        this.faceDetectService.preloadModel(),
      ]);
      this.feedbackText.set('Click Start to begin');
    } catch (err) {
      console.error('Failed to load models:', err);
      this.feedbackText.set('Model load failed');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  EMOTION & WORD SUGGESTIONS
  // ─────────────────────────────────────────────────────────────────────────
  private normalizeEmotion(emotion: string): string {
    return emotion.split(' ')[0]; // "Happy 😄" → "Happy"
  }

  private updateSuggestedWords(letter: string): void {
    const emotion = this.normalizeEmotion(this.currentMood());
    const words =
      EMOTION_WORD_MAP[emotion]?.[letter] ??
      EMOTION_WORD_MAP['Neutral']?.[letter] ??
      [];
    this.suggestedWords.set(words);
  }

  addSuggestedWord(word: string): void {
    const chars = word.toUpperCase().split('');
    this.sentenceBuffer.update((buf) => [...buf, ...chars, ' ']);
    this.feedbackText.set(`Added: ${word}`);
    if (this.isSpeechEnabled()) speakText(word);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LETTER DETECTION LOGIC
  // ─────────────────────────────────────────────────────────────────
  private processLetter(letter: string, confidence: number): void {
    this.currentLetter.set(letter);
    this.currentConfidence.set(confidence);
    const now = Date.now();

    if (letter === this.lastDetectedLetter) {
      this.letterStability.update((v) => v + 1);
    } else {
      this.lastDetectedLetter = letter;
      this.letterStability.set(1);
      this.feedbackText.set(`Detecting ${letter}...`);
      return;
    }

    if (this.letterStability() < this.STABILITY_THRESHOLD) {
      this.feedbackText.set(
        `Hold ${letter}... (${this.letterStability()}/${this.STABILITY_THRESHOLD})`,
      );
      return;
    }

    if (now - this.lastLetterTime < this.MIN_LETTER_INTERVAL) return;

    this.addLetterToSentence(letter);
    this.lastLetterTime = now;
    this.lastLetterTimestamp = now;
    this.letterStability.set(0);

    if (this.autoSpace()) this.resetAutoSpaceTimer();
  }

  private addLetterToSentence(letter: string): void {
    this.sentenceBuffer.update((buf) => [...buf, letter]);
    this.letterHistory.update((hist) => [...hist, letter].slice(-10));
    if (this.isSpeechEnabled()) speakText(letter);
    this.feedbackText.set(`Added: ${letter}`);
  }

  private resetLetterDetection(): void {
    this.currentLetter.set('');
    this.currentConfidence.set(0);
    this.lastDetectedLetter = null;
    this.letterStability.set(0);
  }

  private resetAutoSpaceTimer(): void {
    if (this.spaceTimerHandle) clearTimeout(this.spaceTimerHandle);
    this.spaceTimerHandle = setTimeout(() => {
      if (this.isRecording() && this.sentenceBuffer().length > 0) {
        const last = this.sentenceBuffer()[this.sentenceBuffer().length - 1];
        if (last !== ' ') this.addSpace();
      }
    }, this.AUTO_SPACE_TIMEOUT);
  }

  // ─────────────────────────────────────────────────────────────────
  //  RECORDING CONTROL
  // ─────────────────────────────────────────────────────────────────
  async startRecording(): Promise<void> {
    if (!this.isLoggedIn()) {
      this.feedbackText.set('Please login to use sign detection');
      return;
    }
    if (this.isRecording()) return;

    try {
      this.userService.connect();

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      const video = this.videoElement.nativeElement;
      video.srcObject = this.mediaStream;
      await video.play();

      this.canvasCtx = this.overlayCanvas.nativeElement.getContext('2d');

      this.isRecording.set(true);
      this.feedbackText.set('Initializing...');

      setTimeout(() => {
        this.feedbackText.set('Show hand to start signing');
        this.isProcessingBackend = false;
        this.renderLoop();
      }, 1500);
    } catch (err) {
      console.error('Camera error:', err);
      this.feedbackText.set('Camera access denied');
    }
  }

  stopRecording(): void {
    this.isRecording.set(false);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }

    if (this.spaceTimerHandle) {
      clearTimeout(this.spaceTimerHandle);
      this.spaceTimerHandle = undefined;
    }

    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.mediaStream = null;

    const video = this.videoElement?.nativeElement;
    if (video) video.srcObject = null;

    this.userService.disconnect();

    // Zero out canvas to free GPU memory
    const canvas = this.overlayCanvas?.nativeElement;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    this.canvasCtx = null;

    this.resetLetterDetection();
    this.suggestedWords.set([]);
    this.currentMood.set('Neutral 😐');
    this.feedbackText.set('Stopped');
    this.lastLandmarks = null;
  }

  // ─────────────────────────────────────────────────────────────────
  //  RENDER LOOP (runs outside Angular zone)
  // ─────────────────────────────────────────────────────────────────
  private renderLoop(): void {
    if (!this.isRecording()) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = this.canvasCtx;

    if (!ctx) return;

    // Resize canvas if needed
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Get hand landmarks
    const result = this.handDetectService.getHandCrop(video);

    // Face/emotion detection (throttled inside service to ~5fps)
    const now = performance.now();
    const faceResult = this.faceDetectService.detectEmotion(video, now);
    if (faceResult) {
      this.currentMood.set(faceResult.emotion);
      if (this.currentLetter()) {
        this.updateSuggestedWords(this.currentLetter());
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result && result.landmarks) {
      this.missingFrames = 0;
      this.lastLandmarks = result.landmarks;
      this.drawLandmarks(ctx, result.landmarks);

      if (result.crop && !this.isProcessingBackend) {
        this.isProcessingBackend = true;
        const blob = this.dataURLtoBlob(result.crop);
        const sent = this.userService.sendImage(blob);
        // If socket was unavailable, unblock immediately
        if (!sent) this.isProcessingBackend = false;
      }
    } else if (
      this.lastLandmarks &&
      this.missingFrames < this.MAX_MISSING_FRAMES
    ) {
      this.missingFrames++;
      this.drawLandmarks(ctx, this.lastLandmarks);
    } else {
      this.lastLandmarks = null;
      this.missingFrames = 0;
      this.resetLetterDetection();
    }

    this.animationId = requestAnimationFrame(() => this.renderLoop());
  }

  /** Convert a data URL to Blob synchronously — faster than fetch() for small images */
  private dataURLtoBlob(dataUrl: string): Blob {
    const commaIdx = dataUrl.indexOf(',');
    const mimeMatch = dataUrl.substring(0, commaIdx).match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(dataUrl.substring(commaIdx + 1));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  private drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
  ): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Draw connections
    ctx.save();
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * w, start.y * h);
      ctx.lineTo(end.x * w, end.y * h);
      ctx.stroke();
    }
    ctx.restore();

    // Draw landmark dots
    ctx.fillStyle = '#FF0000';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  SENTENCE ACTIONS
  // ─────────────────────────────────────────────────────────────────
  addSpace(): void {
    this.sentenceBuffer.update((buf) => [...buf, ' ']);
    this.feedbackText.set('Space added');
  }

  backspace(): void {
    this.sentenceBuffer.update((buf) => buf.slice(0, -1));
    this.letterHistory.update((hist) => hist.slice(0, -1));
    this.feedbackText.set('Deleted');
  }

  addPunctuation(punct: string): void {
    this.sentenceBuffer.update((buf) => [...buf, punct, ' ']);
    this.feedbackText.set(`Added ${punct}`);
  }

  removeLetterAt(index: number): void {
    this.sentenceBuffer.update((buf) => {
      const newBuf = [...buf];
      newBuf.splice(index, 1);
      return newBuf;
    });
  }

  clearSentence(): void {
    this.sentenceBuffer.set([]);
    this.letterHistory.set([]);
    this.suggestedWords.set([]);
    this.feedbackText.set('Cleared');
    this.lastLetterTimestamp = 0;
    this.timeSinceLastLetter.set('--');
  }

  async copyToClipboard(): Promise<void> {
    const text = this.sentenceBuffer().join('');
    try {
      await navigator.clipboard.writeText(text);
      this.feedbackText.set('Copied to clipboard!');
    } catch (err) {
      this.feedbackText.set(
        'Copy failed' + (err instanceof Error ? `: ${err.message}` : ''),
      );
    }
  }

  speakSentence(): void {
    const text = this.sentenceBuffer().join('');
    if (text.trim()) {
      speakText(text);
      this.feedbackText.set('Speaking...');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  LIFECYCLE HOOKS
  // ─────────────────────────────────────────────────────────────────
  @HostListener('document:visibilitychange')
  handleVisibilityChange(): void {
    if (document.hidden && this.isRecording()) {
      this.stopRecording();
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();

    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = undefined;
    }

    if (this.spaceTimerHandle) {
      clearTimeout(this.spaceTimerHandle);
      this.spaceTimerHandle = undefined;
    }
  }
}
