// legal.component.ts — NEW FILE
import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

interface LegalSection {
  id: string;
  title: string;
  icon: string;
  lastUpdated: string;
  content: string[];
}

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private routeSub?: Subscription;

  activeSection = signal('privacy');

  year = new Date().getFullYear();

  // All legal sections
  readonly sections: LegalSection[] = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: '🔒',
      lastUpdated: `January ${this.year}`,
      content: [
        '## Privacy Policy',
        'SignSync is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.',
        '## Information We Collect',
        '### Account Information',
        'When you create an account, we collect your username, email address, and encrypted password.',
        '### Usage Data',
        'We collect data about how you interact with our sign language detection features, including:',
        '- Signs detected and their accuracy scores',
        '- Practice session duration and frequency',
        '- Feature usage patterns',
        '### Camera Data',
        'Our sign detection feature accesses your camera in real-time. Important:',
        '- Camera frames are processed locally in your browser',
        '- Only skeleton/landmark data is sent to our servers — never raw video',
        '- No camera data is stored permanently',
        '## How We Use Your Data',
        '- To provide and improve sign language detection accuracy',
        '- To track your learning progress on the dashboard',
        '- To personalize practice recommendations',
        '- To send you updates if you subscribe to our newsletter',
        '## Data Security',
        'We use industry-standard encryption (HTTPS, bcrypt password hashing) and follow security best practices to protect your data.',
        '## Your Rights',
        'You can export or delete your data at any time from Settings > Privacy & Data. Account deletion permanently removes all associated data.',
        '## Contact',
        'For privacy concerns, contact us at privacy@signsync.com',
      ],
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: '📋',
      lastUpdated: `January ${this.year}`,
      content: [
        '## Terms of Service',
        'By using SignSync, you agree to these terms. Please read them carefully.',
        '## Acceptable Use',
        'You agree to use SignSync only for its intended purpose: learning and practicing sign language communication.',
        '- Do not attempt to reverse-engineer our ML models',
        '- Do not use automated scripts to overwhelm our detection API',
        '- Do not create multiple accounts to circumvent limitations',
        '## Account Responsibilities',
        'You are responsible for maintaining the security of your account. Use a strong password and do not share your credentials.',
        '## Service Availability',
        'SignSync is provided "as is." We strive for high availability but do not guarantee uninterrupted service. Our ML model provides predictions with approximately 96.6% accuracy but is not infallible.',
        '## Intellectual Property',
        'The SignSync platform, including our ML models, UI designs, and documentation, is protected by intellectual property laws.',
        '## Limitation of Liability',
        'SignSync is an educational tool and should not be used as the sole means of critical communication. We are not liable for misinterpretations or communication errors.',
        '## Changes to Terms',
        'We may update these terms periodically. Continued use of SignSync after changes constitutes acceptance of the new terms.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      icon: '🍪',
      lastUpdated: `January ${this.year}`,
      content: [
        '## Cookie Policy',
        'SignSync uses cookies and similar technologies to enhance your experience.',
        '## Essential Cookies',
        'These are required for the platform to function:',
        '- Authentication token (keeps you logged in)',
        '- CSRF protection token',
        '- Session identifier',
        '## Preference Cookies',
        'These remember your settings:',
        '- Theme preference (dark/light/system)',
        '- Font size and family settings',
        '- Camera resolution preference',
        '- Detection confidence threshold',
        '## Analytics Cookies',
        'We may use analytics to understand how users interact with SignSync. These cookies collect anonymous usage data.',
        '## Managing Cookies',
        'You can manage cookie preferences in Settings > Privacy & Data. Essential cookies cannot be disabled as they are required for the platform to function.',
        'You can also control cookies through your browser settings, but this may affect platform functionality.',
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: '♿',
      lastUpdated: `January ${this.year}`,
      content: [
        '## Accessibility Statement',
        'SignSync is committed to making sign language learning accessible to everyone.',
        '## Our Commitment',
        'We aim to conform to WCAG 2.1 Level AA standards. Our platform includes:',
        '- Keyboard navigation support for all interactive elements',
        '- Screen reader compatible labels and ARIA attributes',
        '- High contrast mode in Settings > Accessibility',
        '- Reduced motion mode that disables all animations',
        '- Adjustable font sizes (Small to X-Large)',
        '- Multiple font family options including system fonts',
        '## Sign Language Specific',
        'As a sign language platform, we recognize unique accessibility needs:',
        '- Clear visual feedback for detection results',
        '- High-contrast hand landmark overlays',
        '- Text alternatives for all sign demonstrations',
        '- Adjustable detection confidence thresholds',
        '## Known Limitations',
        '- Real-time camera detection requires visual interaction',
        '- Some chart visualizations on the dashboard may have limited screen reader support',
        '- We are actively working to improve these areas',
        '## Feedback',
        'If you encounter accessibility barriers, please contact us at accessibility@signsync.com. We take all feedback seriously and aim to respond within 5 business days.',
      ],
    },
  ];

  currentSection = signal<LegalSection>(this.sections[0]);

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      const sectionId = params['section'] || 'privacy';
      this.activeSection.set(sectionId);
      const found = this.sections.find((s) => s.id === sectionId);
      if (found) {
        this.currentSection.set(found);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
