import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface FaqItem {
  question: string;
  answer: string;
}

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Tip {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-help',
  imports: [FontAwesomeModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpComponent {
  protected readonly faChevronDown = faChevronDown;
  protected readonly openFaqIndex = signal<number | null>(null);

  protected readonly faqs: FaqItem[] = [
    {
      question: 'What sign language alphabet does SignSync support?',
      answer:
        'SignSync currently supports the American Sign Language (ASL) fingerspelling alphabet (A–Z), along with special gestures for SPACE and DEL to help you build words and sentences hands-free.',
    },
    {
      question: 'How do I add a space between words?',
      answer:
        'Sign the SPACE gesture to insert a word boundary. If "Auto-add spaces" is enabled in settings, a space is automatically added after a short pause in signing. You can also tap the Space button in the Quick Actions panel.',
    },
    {
      question: 'How do I delete the last letter?',
      answer:
        'Sign the DEL gesture to remove the last character from your sentence. You can also tap the ⌫ Backspace button in the Quick Actions panel, or click any individual letter in the sentence area to remove it.',
    },
    {
      question: 'Why is my gesture not being detected?',
      answer:
        'Ensure your hand is fully visible, well-lit, and centred in the camera frame. Keep your background as plain as possible. Hold each sign steady until the stability ring completes. If detection is still unreliable, try the Retry button to reload the AI model.',
    },
    {
      question: 'How do I control the reading speed?',
      answer:
        'Enable "Voice feedback" in the settings panel, then use the Reading Speed slider that appears below it. Drag left for slower speech and right for faster speech. The label shows Slow / Normal / Fast / Very Fast.',
    },
    {
      question: 'Can I copy or share my sentence?',
      answer:
        'Yes! Once your sentence is built, use the Copy button in the Quick Actions panel to copy it to your clipboard. You can also tap the Speak button to have the full sentence read aloud.',
    },
    {
      question: 'What does the AI word suggestion bar do?',
      answer:
        'As you sign letters, SignSync predicts likely words based on your current input and shows them as suggestions. Tap any suggestion to instantly append the full word to your sentence — great for speeding up common words.',
    },
  ];

  protected readonly features: FeatureCard[] = [
    {
      icon: '🤚',
      title: 'Gesture Detection',
      description:
        'Real-time ASL fingerspelling recognition powered by a hand-landmark AI model running entirely in your browser.',
      color: 'bg-primary/15 text-primary',
    },
    {
      icon: '🔤',
      title: 'Sign Translator',
      description:
        'Convert written text into animated sign-language images, displayed letter by letter at an adjustable speed.',
      color: 'bg-info/15 text-info',
    },
    {
      icon: '🎙️',
      title: 'Voice Feedback',
      description:
        'Hear each detected letter or your full sentence spoken aloud via the browser Speech Synthesis API, with speed control.',
      color: 'bg-success/15 text-success',
    },
    {
      icon: '💡',
      title: 'AI Word Suggestions',
      description:
        'Smart word-completion suggestions appear as you sign, letting you append whole words with a single tap.',
      color: 'bg-warning/15 text-warning',
    },
    {
      icon: '✏️',
      title: 'Editable Sentence',
      description:
        'Click any letter in your sentence to remove it, use Backspace to delete the last character, or clear everything at once.',
      color: 'bg-accent-pink/15 text-accent-pink',
    },
    {
      icon: '⚡',
      title: 'Offline-Ready AI',
      description:
        'The hand-detection model is preloaded and runs locally — no internet connection required once the page has loaded.',
      color: 'bg-accent-purple/15 text-accent-purple',
    },
  ];

  protected readonly tips: Tip[] = [
    {
      icon: '💡',
      title: 'Good lighting is key',
      description:
        'Face a light source so your hand is evenly lit. Avoid signing in front of a bright window that silhouettes your hand.',
    },
    {
      icon: '📐',
      title: 'Keep hand centred',
      description:
        "Position your signing hand in the middle of the camera frame at roughly arm's length for the most accurate detection.",
    },
    {
      icon: '🎯',
      title: 'Hold each sign steady',
      description:
        'Wait for the purple stability ring to complete before moving to the next letter. Rushing causes missed or wrong characters.',
    },
    {
      icon: '🌑',
      title: 'Plain background helps',
      description:
        "A neutral, clutter-free background improves the model's ability to isolate your hand from the rest of the scene.",
    },
  ];

  protected isFaqOpen = computed(
    () => (index: number) => this.openFaqIndex() === index,
  );

  toggleFaq(index: number): void {
    this.openFaqIndex.update((current) => (current === index ? null : index));
  }
}
