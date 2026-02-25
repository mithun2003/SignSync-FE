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
import { RouterModule } from '@angular/router';
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
  styleUrls: ['./gesture-detection.component.css'], // Don't forget this
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
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
  
  // Feedback
  feedbackText = 'Click Start to begin';
  
  // Stats
  letterCount = computed(() => this.sentenceBuffer().filter(c => c !== ' ').length);
  wordCount = computed(() => this.sentenceBuffer().join('').trim().split(/\s+/).filter(w => w).length);
  timeSinceLastLetter = signal<string>('--');

  // Internal State
  private mediaStream: MediaStream | null = null;
  private animationId?: number;
  private isProcessingBackend = false;
  private lastLandmarks: NormalizedLandmark[] | null = null;
  private missingFrames = 0;
  private readonly MAX_MISSING_FRAMES = 5;
  
  // Letter Detection Logic
  private lastDetectedLetter: string | null = null;
  private lastLetterTime = 0;
  private letterStability = signal(0);
  private readonly STABILITY_THRESHOLD = 5; // Need 5 consecutive frames
  private readonly MIN_LETTER_INTERVAL = 800; // 800ms between same letters
  private readonly AUTO_SPACE_TIMEOUT = 2000; // 2s pause = auto space
  
  private lastLetterTimestamp = 0;
  private spaceTimerHandle?: ReturnType<typeof setTimeout>;

  // ─────────────────────────────────────────────────────────────────────────
  //  LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────
  constructor() {
    // Effect: Preload models when logged in
    effect(async () => {
      const loggedIn = this.isLoggedIn();
      if (!loggedIn) {
        this.feedbackText = 'Login required to start detection';
        return;
      }
      
      this.feedbackText = 'Loading AI models...';
      await Promise.all([
        this.handDetectService.preloadModel(),
        this.faceDetectService.preloadModel(),
      ]);
      this.feedbackText = 'Click Start to begin';
    });

    // Effect: Process predictions from backend
    effect(() => {
      const result = this.userService.predictionResult();
      if (!result) return;
      
      this.isProcessingBackend = false;
      
      // Handle special states
      if (!result.label || result.label === 'error' || result.label === 'no_hand') {
        if (result.label === 'no_hand') {
          this.feedbackText = 'Show hand to camera';
        }
        this.resetLetterDetection();
        this.suggestedWords.set([]);
        return;
      }
      
      if (result.label === 'uncertain') {
        this.feedbackText = 'Hold steady...';
        return;
      }
      
      // Valid letter detected
      this.processLetter(result.label, result.confidence);
      
      // Update suggested words based on emotion + letter
      this.updateSuggestedWords(result.label);
    });

    // Update time since last letter
    setInterval(() => {
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
    }, 100);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  EMOTION & WORD SUGGESTIONS
  // ─────────────────────────────────────────────────────────────────────────
  private normalizeEmotion(emotion: string): string {
    return emotion.split(' ')[0]; // "Happy 😄" → "Happy"
  }

  private updateSuggestedWords(letter: string) {
    const emotionRaw = this.currentMood();
    const emotion = this.normalizeEmotion(emotionRaw);
    
    // Get words for current emotion + letter
    const words = 
      EMOTION_WORD_MAP[emotion]?.[letter] ??
      EMOTION_WORD_MAP['Neutral']?.[letter] ??
      [];
    
    this.suggestedWords.set(words);
  }

  addSuggestedWord(word: string) {
    // Add the word letter by letter
    for (const char of word.toUpperCase()) {
      this.sentenceBuffer.update(buf => [...buf, char]);
    }
    
    // Add space after word
    this.sentenceBuffer.update(buf => [...buf, ' ']);
    
    this.feedbackText = `Added: ${word}`;
    
    if (this.isSpeechEnabled()) {
      speakText(word);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LETTER DETECTION LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  private processLetter(letter: string, confidence: number) {
    this.currentLetter.set(letter);
    this.currentConfidence.set(confidence);
    
    const now = Date.now();
    
    // Stability check: same letter for N frames
    if (letter === this.lastDetectedLetter) {
      this.letterStability.update(v => v + 1);
    } else {
      this.lastDetectedLetter = letter;
      this.letterStability.set(1);
      this.feedbackText = `Detecting ${letter}...`;
      return;
    }
    
    // Not stable enough yet
    if (this.letterStability() < this.STABILITY_THRESHOLD) {
      this.feedbackText = `Hold ${letter}... (${this.letterStability()}/${this.STABILITY_THRESHOLD})`;
      return;
    }
    
    // Too soon after last letter (prevent duplicates)
    if (now - this.lastLetterTime < this.MIN_LETTER_INTERVAL) {
      return;
    }
    
    // ✅ Letter is stable and ready to add!
    this.addLetterToSentence(letter);
    this.lastLetterTime = now;
    this.lastLetterTimestamp = now;
    this.letterStability.set(0);
    
    // Auto-space timer
    if (this.autoSpace()) {
      this.resetAutoSpaceTimer();
    }
  }

  private addLetterToSentence(letter: string) {
    // Add to sentence buffer
    this.sentenceBuffer.update(buf => [...buf, letter]);
    
    // Add to history (keep last 10)
    this.letterHistory.update(hist => {
      const newHist = [...hist, letter];
      return newHist.slice(-10);
    });
    
    // Speak if enabled
    if (this.isSpeechEnabled()) {
      speakText(letter);
    }
    
    this.feedbackText = `Added: ${letter}`;
  }

  private resetLetterDetection() {
    this.currentLetter.set('');
    this.currentConfidence.set(0);
    this.lastDetectedLetter = null;
    this.letterStability.set(0);
  }

  private resetAutoSpaceTimer() {
    if (this.spaceTimerHandle) {
      clearTimeout(this.spaceTimerHandle);
    }
    
    this.spaceTimerHandle = setTimeout(() => {
      if (this.isRecording() && this.sentenceBuffer().length > 0) {
        const lastChar = this.sentenceBuffer()[this.sentenceBuffer().length - 1];
        if (lastChar !== ' ') {
          this.addSpace();
        }
      }
    }, this.AUTO_SPACE_TIMEOUT);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RECORDING CONTROL
  // ─────────────────────────────────────────────────────────────────────────
  async startRecording() {
    if (!this.isLoggedIn()) {
      this.feedbackText = 'Please login to use sign detection';
      return;
    }
    if (this.isRecording()) return;

    try {
      // Connect WebSocket
      this.userService.connect();
      
      // Get camera stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      
      this.videoElement.nativeElement.srcObject = this.mediaStream;
      await this.videoElement.nativeElement.play();
      
      this.isRecording.set(true);
      this.feedbackText = 'Initializing...';
      
      // Start AI loop after short delay
      setTimeout(() => {
        this.feedbackText = 'Show hand to start signing';
        this.isProcessingBackend = false;
        this.renderLoop();
      }, 1500);
      
    } catch (err) {
      console.error('Camera error:', err);
      this.feedbackText = 'Camera access denied';
    }
  }

  stopRecording() {
    if (!this.isLoggedIn()) return;
    
    this.isRecording.set(false);
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.spaceTimerHandle) {
      clearTimeout(this.spaceTimerHandle);
    }
    
    this.mediaStream?.getTracks().forEach(t => t.stop());
    this.videoElement.nativeElement.srcObject = null;
    
    this.userService.disconnect();
    this.clearCanvas();
    
    this.resetLetterDetection();
    this.suggestedWords.set([]);
    this.currentMood.set('Neutral 😐');
    this.feedbackText = 'Stopped';
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER LOOP
  // ─────────────────────────────────────────────────────────────────────────
  private renderLoop() {
    if (!this.isLoggedIn() || !this.isRecording()) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Resize canvas
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Get hand landmarks
    const result = this.handDetectService.getHandCrop(video);
    
    // 🎭 FACE/EMOTION DETECTION
    const now = performance.now();
    const faceResult = this.faceDetectService.detectEmotion(video, now);
    if (faceResult) {
      this.currentMood.set(faceResult.emotion);
      
      // Update suggested words when emotion changes
      if (this.currentLetter()) {
        this.updateSuggestedWords(this.currentLetter());
      }
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smoothing logic
    if (result && result.landmarks) {
      this.missingFrames = 0;
      this.lastLandmarks = result.landmarks;
      this.drawLandmarks(ctx, result.landmarks);

      // Send to backend
      if (result.crop && !this.isProcessingBackend) {
        this.isProcessingBackend = true;
        const base64Data = result.crop.split(',')[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        this.userService.sendImage(bytes.buffer);
      }
    } else if (this.lastLandmarks && this.missingFrames < this.MAX_MISSING_FRAMES) {
      this.missingFrames++;
      this.drawLandmarks(ctx, this.lastLandmarks);
    } else {
      this.lastLandmarks = null;
      this.missingFrames = 0;
      this.resetLetterDetection();
    }

    this.animationId = requestAnimationFrame(() => this.renderLoop());
  }

  private drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Draw connections
    ctx.save();
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
    ctx.restore();

    // Draw landmarks
    ctx.fillStyle = '#FF0000';
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private clearCanvas() {
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SENTENCE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  addSpace() {
    this.sentenceBuffer.update(buf => [...buf, ' ']);
    this.feedbackText = 'Space added';
  }

  backspace() {
    this.sentenceBuffer.update(buf => buf.slice(0, -1));
    if (this.letterHistory().length > 0) {
      this.letterHistory.update(hist => hist.slice(0, -1));
    }
    this.feedbackText = 'Deleted';
  }

  addPunctuation(punct: string) {
    this.sentenceBuffer.update(buf => [...buf, punct, ' ']);
    this.feedbackText = `Added ${punct}`;
  }

  removeLetterAt(index: number) {
    this.sentenceBuffer.update(buf => {
      const newBuf = [...buf];
      newBuf.splice(index, 1);
      return newBuf;
    });
  }

  clearSentence() {
    this.sentenceBuffer.set([]);
    this.letterHistory.set([]);
    this.suggestedWords.set([]);
    this.feedbackText = 'Cleared';
    this.lastLetterTimestamp = 0;
    this.timeSinceLastLetter.set('--');
  }

  async copyToClipboard() {
    const text = this.sentenceBuffer().join('');
    try {
      await navigator.clipboard.writeText(text);
      this.feedbackText = 'Copied to clipboard!';
    } catch (err) {
      this.feedbackText = 'Copy failed' + (err instanceof Error ? `: ${err.message}` : '');
    }
  }

  speakSentence() {
    const text = this.sentenceBuffer().join('');
    if (text.trim()) {
      speakText(text);
      this.feedbackText = 'Speaking...';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LIFECYCLE HOOKS
  // ─────────────────────────────────────────────────────────────────────────
  @HostListener('document:visibilitychange')
  handleVisibilityChange() {
    if (document.hidden && this.isRecording()) {
      this.stopRecording();
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
    if (this.spaceTimerHandle) {
      clearTimeout(this.spaceTimerHandle);
    }
  }
}