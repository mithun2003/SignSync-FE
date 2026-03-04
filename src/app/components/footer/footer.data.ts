// footer.data.ts — FIXED ROUTES
import {
  faGithub,
  faXTwitter,
  faLinkedinIn,
  faInstagram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons';

// ─── Interfaces ───
export interface SocialLink {
  name: string;
  icon: IconDefinition;
  url: string;
  ariaLabel: string;
  hoverColor: string;
}

export interface NavLink {
  label: string;
  route?: string;          // Internal routerLink
  fragment?: string;       // Scroll-to anchor (#features, #how-it-works)
  external?: string;       // External URL (opens new tab)
  disabled?: boolean;      // Greyed out + "SOON" badge
  badge?: string;          // Badge text (e.g., "SOON", "NEW")
  authRequired?: boolean;  // Show lock icon
}

export interface NavColumn {
  title: string;
  dotColor: string;
  links: NavLink[];
}

export interface LegalLink {
  label: string;
  route: string;
}

// ─── Social Links ───
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'GitHub',
    icon: faGithub,
    url: 'https://github.com/your-org/signsync',  // ← your actual repo
    ariaLabel: 'GitHub',
    hoverColor: 'hover:text-white',
  },
  {
    name: 'X',
    icon: faXTwitter,
    url: 'https://twitter.com/signsync',
    ariaLabel: 'X / Twitter',
    hoverColor: 'hover:text-white',
  },
  {
    name: 'LinkedIn',
    icon: faLinkedinIn,
    url: 'https://linkedin.com/company/signsync',
    ariaLabel: 'LinkedIn',
    hoverColor: 'hover:text-[#0A66C2]',
  },
  {
    name: 'Instagram',
    icon: faInstagram,
    url: 'https://instagram.com/signsync',
    ariaLabel: 'Instagram',
    hoverColor: 'hover:text-[#E4405F]',
  },
];

// ─── Navigation Columns ───
export const NAV_COLUMNS: NavColumn[] = [
  {
    title: 'Product',
    dotColor: 'bg-primary',
    links: [
      { label: 'Features', route: '/', fragment: 'features' },
      { label: 'How It Works', route: '/', fragment: 'how-it-works' },

      { label: 'Sign Detection', route: '/gesture-detection' },

      { label: 'Dashboard', route: '/dashboard', authRequired: true },

      { label: 'Pricing', disabled: true, badge: 'SOON' },
    ],
  },
  {
    title: 'Resources',
    dotColor: 'bg-accent-purple',
    links: [
      { label: 'Help Center', route: '/help' },
      { label: 'Sign Reference', route: '/help', fragment: 'sign-reference' },
      { label: 'Tutorials', route: '/help', fragment: 'tutorials' },
      {
        label: 'API Docs',
        external: 'https://github.com/your-org/signsync#api-documentation',
      },
      // OR use internal route:
      // { label: 'API Docs', route: '/help', fragment: 'api-docs' },

      { label: 'Blog', route: '/help', fragment: 'blog' },
    ],
  },
];

// ─── Legal Links ───
// ✅ FIX #5: All point to /legal with different fragments
export const LEGAL_LINKS: LegalLink[] = [
  { label: 'Privacy Policy', route: '/legal/privacy' },
  { label: 'Terms of Service', route: '/legal/terms' },
  { label: 'Cookie Policy', route: '/legal/cookies' },
  { label: 'Accessibility', route: '/legal/accessibility' },
];