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
  imports: [DecimalPipe, RouterLink, FontAwesomeModule, CommonButtonComponent],
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
  speechRate = signal(0.7);

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
  private lastLandmarks: NormalizedLandmark[] | null = null;
  private missingFrames = 0;
  private readonly MAX_MISSING_FRAMES = 5;

  private canvasCtx: CanvasRenderingContext2D | null = null;

  // Message editing mode
  isEditingMessage = signal(false);

  // Letter Detection Logic
  private lastDetectedLetter: string | null = null;
  private lastLetterTime = 0;
  protected letterStability = signal(0);
  protected readonly STABILITY_THRESHOLD = 6; // 6 consecutive frames (~900ms) to confirm
  private readonly MIN_LETTER_INTERVAL = 1500; // ms between accepted letters
  private readonly MIN_CONFIDENCE = 85; // Regular letters: ≥85% confidence (0–100 scale)
  private readonly AUTO_SPACE_TIMEOUT = 2500;

  // Custom / emergency signs trained on synthetic data — need a lower bar
  private readonly EMERGENCY_LABELS = new Set([
    'help',
    'danger',
    'emergency',
    'thumbs_down',
    'ok_sign',
  ]);
  private readonly EMERGENCY_MIN_CONFIDENCE = 20; // lower threshold for custom signs
  private readonly EMERGENCY_STABILITY = 4; // fewer frames needed (~600ms)

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
      // Load models in parallel; face detection is optional — don't let it block hands
      await Promise.allSettled([
        this.handDetectService.preloadModel(),
        this.faceDetectService.preloadModel(),
      ]);

      if (!this.handDetectService.isReady()) {
        this.feedbackText.set('Model failed to load — tap Retry');
      } else {
        this.feedbackText.set('Ready — tap Start to begin');
      }
    } catch (err) {
      console.error('Unexpected error loading models:', err);
      this.feedbackText.set('Model failed to load — tap Retry');
    }
  }

  async retryModelLoad(): Promise<void> {
    this.feedbackText.set('Retrying model load...');
    await this.loadModels();
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
    if (this.isSpeechEnabled()) speakText(word, this.speechRate());
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  EMERGENCY WORDS
  // ─────────────────────────────────────────────────────────────────────────
  readonly emergencyWords: { label: string; icon: string }[] = [
    { label: 'HELP', icon: '🆘' },
    { label: 'CALL 911', icon: '🚨' },
    { label: 'DOCTOR', icon: '🏥' },
    { label: 'AMBULANCE', icon: '🚑' },
    { label: 'FIRE', icon: '🔥' },
    { label: 'POLICE', icon: '👮' },
    { label: 'PAIN', icon: '😣' },
    { label: 'EMERGENCY', icon: '⚠️' },
    { label: 'CANT BREATHE', icon: '😮‍💨' },
    { label: 'FALLING', icon: '🤕' },
    { label: 'ALLERGIC', icon: '💊' },
    { label: 'BLEEDING', icon: '🩸' },
  ];

  addEmergencyWord(phrase: string): void {
    const chars = phrase.toUpperCase().split('');
    this.sentenceBuffer.update((buf) => {
      const needsSpace = buf.length > 0 && buf[buf.length - 1] !== ' ';
      return [...buf, ...(needsSpace ? [' '] : []), ...chars, ' '];
    });
    this.feedbackText.set(`Added: ${phrase}`);
    if (this.isSpeechEnabled()) speakText(phrase, this.speechRate());
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LETTER DETECTION LOGIC
  // ─────────────────────────────────────────────────────────────────
  private processLetter(letter: string, confidence: number): void {
    const isEmergency = this.EMERGENCY_LABELS.has(letter.toLowerCase());
    const minConfidence = isEmergency
      ? this.EMERGENCY_MIN_CONFIDENCE
      : this.MIN_CONFIDENCE;
    const stabilityNeeded = isEmergency
      ? this.EMERGENCY_STABILITY
      : this.STABILITY_THRESHOLD;

    // Reject low-confidence predictions to avoid false letters
    if (confidence < minConfidence) {
      this.resetLetterDetection();
      this.feedbackText.set(
        `Low confidence (${Math.round(confidence)}%) — hold steady`,
      );
      return;
    }

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

    if (this.letterStability() < stabilityNeeded) {
      this.feedbackText.set(
        `Hold ${letter}... (${this.letterStability()}/${stabilityNeeded})`,
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

  protected readonly EMERGENCY_DISPLAY: Record<string, string> = {
    help: 'HELP',
    danger: 'DANGER',
    emergency: 'EMERGENCY',
    thumbs_down: 'THUMBS DOWN',
    ok_sign: 'OK',
  };

  readonly isEmergencyLetter = computed(
    () => this.currentLetter().toLowerCase() in this.EMERGENCY_DISPLAY,
  );

  private addLetterToSentence(letter: string): void {
    const normalized = letter.toLowerCase();

    if (normalized === 'del' || normalized === 'delete') {
      this.sentenceBuffer.update((buf) => buf.slice(0, -1));
      this.letterHistory.update((hist) => [...hist, '⌫'].slice(-10));
      this.feedbackText.set('Deleted last character');
      if (this.isSpeechEnabled()) speakText('delete', this.speechRate());
      return;
    }

    // Emergency / custom signs: add as full word + trailing space
    if (this.EMERGENCY_DISPLAY[normalized]) {
      const word = this.EMERGENCY_DISPLAY[normalized];
      this.sentenceBuffer.update((buf) => [...buf, word, ' ']);
      this.letterHistory.update((hist) => [...hist, word].slice(-10));
      if (this.isSpeechEnabled()) speakText(word, this.speechRate());
      this.feedbackText.set(`Added: ${word}`);
      return;
    }

    const entry = normalized === 'space' ? ' ' : letter;
    this.sentenceBuffer.update((buf) => [...buf, entry]);
    this.letterHistory.update((hist) => [...hist, entry].slice(-10));
    if (this.isSpeechEnabled())
      speakText(entry.trim() || 'space', this.speechRate());
    this.feedbackText.set(
      normalized === 'space' ? 'Added space' : `Added: ${letter}`,
    );
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

    // Clear canvas without destroying it (zeroing dimensions would corrupt WebGL contexts)
    const canvas = this.overlayCanvas?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    try {
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

        // Send the 21 MediaPipe landmarks as JSON — backend SVM classifies directly.
        // ~500 B per message vs ~30 KB JPEG; no skeleton preprocessing needed.
        this.userService.sendLandmarks(result.landmarks);
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
    } catch (err) {
      // Catch any unexpected errors so the render loop keeps running
      console.warn('[renderLoop] frame error (skipping):', err);
    }

    this.animationId = requestAnimationFrame(() => this.renderLoop());
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
      speakText(text, this.speechRate());
      this.feedbackText.set('Speaking...');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  MESSAGE EDITING
  // ─────────────────────────────────────────────────────────────────
  toggleEditMessage(): void {
    this.isEditingMessage.update((v) => !v);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEdit(event: KeyboardEvent): void {
    if (!this.isEditingMessage()) return;

    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault();
      this.sentenceBuffer.update((buf) => buf.slice(0, -1));
      return;
    }

    if (key === ' ') {
      event.preventDefault();
      this.sentenceBuffer.update((buf) => [...buf, ' ']);
      return;
    }

    if (/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
      this.sentenceBuffer.update((buf) => [...buf, key.toUpperCase()]);
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
