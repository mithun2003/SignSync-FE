// text-to-sign.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/pro-regular-svg-icons';

import { CommonService } from '@core/services/common/common.service';
import { CommonButtonComponent } from 'app/shared/components/common-button/common-button.component';
import { getSignImageUrl } from './sign-images.config';

@Component({
  selector: 'app-text-to-sign',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,
    CommonButtonComponent,
  ],
})
export class TranslateComponent implements OnDestroy {
  public commonService = inject(CommonService);

  // Icons
  faSpinner = faSpinner;

  // State
  inputText = '';
  animationSpeedValue = 1500; // milliseconds per sign
  
  // Signals
  isPlaying = signal(false);
  currentLetterIndex = signal(0);
  letters = signal<string[]>([]);
  currentLetter = signal<string>('');
  currentSignImage = signal<string>('');
  imageLoading = signal(false);
  animationSpeed = signal(1500);

  // Computed
  readonly isLoggedIn = computed(() => this.commonService.isSignedIn());
  progress = computed(() => {
    const total = this.letters().length;
    if (total === 0) return 0;
    return ((this.currentLetterIndex() + 1) / total) * 100;
  });

  private animationTimer?: ReturnType<typeof setInterval>;

  // ─────────────────────────────────────────────────────────────────────────
  //  TEXT PROCESSING
  // ─────────────────────────────────────────────────────────────────────────
  onTextChange() {
    // Extract only A-Z letters (case insensitive)
    const cleaned = this.inputText
      .toUpperCase()
      .split('')
      .filter((char) => /[A-Z]/.test(char));
    
    this.letters.set(cleaned);
    
    // Reset if playing
    if (this.isPlaying()) {
      this.stop();
    }
    
    // Show first letter if exists
    if (cleaned.length > 0) {
      this.currentLetterIndex.set(0);
      this.updateCurrentSign();
    } else {
      this.currentLetter.set('');
      this.currentSignImage.set('');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  PLAYBACK CONTROL
  // ─────────────────────────────────────────────────────────────────────────
  togglePlay() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.letters().length === 0) return;

    this.isPlaying.set(true);
    
    // Start animation loop
    this.animationTimer = setInterval(() => {
      const current = this.currentLetterIndex();
      const total = this.letters().length;
      
      if (current >= total - 1) {
        // Reached end
        this.stop();
        return;
      }
      
      // Move to next letter
      this.currentLetterIndex.set(current + 1);
      this.updateCurrentSign();
    }, this.animationSpeed());
  }

  pause() {
    this.isPlaying.set(false);
    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = undefined;
    }
  }

  stop() {
    this.pause();
    // Don't reset index, stay at current position
  }

  reset() {
    this.pause();
    this.currentLetterIndex.set(0);
    this.updateCurrentSign();
  }

  clear() {
    this.pause();
    this.inputText = '';
    this.letters.set([]);
    this.currentLetter.set('');
    this.currentSignImage.set('');
    this.currentLetterIndex.set(0);
  }

  jumpToLetter(index: number) {
    if (this.isPlaying()) return;
    this.currentLetterIndex.set(index);
    this.updateCurrentSign();
  }

  onSpeedChange() {
    this.animationSpeed.set(this.animationSpeedValue);
    
    // If playing, restart timer with new speed
    if (this.isPlaying()) {
      this.pause();
      this.play();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SIGN IMAGE LOADING
  // ─────────────────────────────────────────────────────────────────────────
  private updateCurrentSign() {
    const index = this.currentLetterIndex();
    const letter = this.letters()[index];
    
    if (!letter) return;
    
    this.currentLetter.set(letter);
    this.imageLoading.set(true);
    
    // ✅ USE THIS: Google Drive direct link
    // this.currentSignImage.set(getSignImageUrl(letter));
    
    // Alternative options:
    // Option 1: Local assets (requires images in frontend)
    this.currentSignImage.set(`/asl-signs/${letter.toUpperCase()}.jpg`);
    
    // Option 2: Backend API endpoint
    // this.currentSignImage.set(`/api/signs/${letter.toLowerCase()}`);
    
    // Option 3: Imgur CDN (see solution 2 below)
    // this.currentSignImage.set(`https://i.imgur.com/${IMGUR_HASH[letter]}.jpg`);
  }

  onImageLoad() {
    this.imageLoading.set(false);
  }

  onImageError() {
    this.imageLoading.set(false);
    console.error(`Failed to load sign image for letter: ${this.currentLetter()}`);
    
    // Fallback: show letter in large text instead of image
    // Or use a placeholder image
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.pause();
  }
}