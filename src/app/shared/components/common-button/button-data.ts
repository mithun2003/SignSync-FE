// button-data.ts - Updated for Tailwind v4 Design System

export interface ButtonColorTheme {
  // Filled button styles
  text: string;
  bg: string;
  hoverBg: string;

  // Outline button styles
  outlineText: string;
  outlineBorder: string;
  outlineHoverBg: string;
}

/**
 * ✅ COLOR THEMES - Updated to new design system
 * Maps color names to Tailwind classes using new variables
 */
export const COLOR_THEME_MAP: Record<string, ButtonColorTheme> = {
  // Primary (Violet/Purple) - Main brand color
  primary: {
    text: 'text-white',
    bg: 'bg-primary',
    hoverBg: 'bg-primary-dark',

    outlineText: 'text-primary',
    outlineBorder: 'border-primary',
    outlineHoverBg: 'bg-primary/10',
  },

  // Violet (Legacy support)
  violet: {
    text: 'text-white',
    bg: 'bg-primary',
    hoverBg: 'bg-primary-dark',

    outlineText: 'text-primary',
    outlineBorder: 'border-primary',
    outlineHoverBg: 'bg-primary/10',
  },

  // Success (Green)
  success: {
    text: 'text-white',
    bg: 'bg-success',
    hoverBg: 'bg-success-dark',

    outlineText: 'text-success',
    outlineBorder: 'border-success',
    outlineHoverBg: 'bg-success/10',
  },

  // Green (Alias for success)
  green: {
    text: 'text-white',
    bg: 'bg-success',
    hoverBg: 'bg-success-dark',

    outlineText: 'text-success',
    outlineBorder: 'border-success',
    outlineHoverBg: 'bg-success/10',
  },

  // Danger (Red)
  danger: {
    text: 'text-white',
    bg: 'bg-danger',
    hoverBg: 'bg-danger-dark',

    outlineText: 'text-danger',
    outlineBorder: 'border-danger',
    outlineHoverBg: 'bg-danger/10',
  },

  // Red (Alias for danger)
  red: {
    text: 'text-white',
    bg: 'bg-danger',
    hoverBg: 'bg-danger-dark',

    outlineText: 'text-danger',
    outlineBorder: 'border-danger',
    outlineHoverBg: 'bg-danger/10',
  },

  // Warning (Amber)
  warning: {
    text: 'text-neutral-black',
    bg: 'bg-warning',
    hoverBg: 'bg-warning/80',

    outlineText: 'text-warning',
    outlineBorder: 'border-warning',
    outlineHoverBg: 'bg-warning/10',
  },

  // Info (Blue)
  info: {
    text: 'text-white',
    bg: 'bg-info',
    hoverBg: 'bg-info/80',

    outlineText: 'text-info',
    outlineBorder: 'border-info',
    outlineHoverBg: 'bg-info/10',
  },

  // White (for dark backgrounds)
  white: {
    text: 'text-neutral-black',
    bg: 'bg-white',
    hoverBg: 'bg-neutral-silver',

    outlineText: 'text-white',
    outlineBorder: 'border-white',
    outlineHoverBg: 'bg-white/10',
  },

  // Black
  black: {
    text: 'text-white',
    bg: 'bg-neutral-black',
    hoverBg: 'bg-neutral-d-grey',

    outlineText: 'text-neutral-black',
    outlineBorder: 'border-neutral-black',
    outlineHoverBg: 'bg-neutral-black/10',
  },

  // Neutral/Secondary
  secondary: {
    text: 'text-white',
    bg: 'bg-bg-card',
    hoverBg: 'bg-bg-hover',

    outlineText: 'text-font-primary',
    outlineBorder: 'border-border-primary',
    outlineHoverBg: 'bg-white/5',
  },
};

/**
 * ✅ BUTTON SIZE PRESETS
 */
export const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 sm:px-6 text-sm',
  lg: 'h-12 px-6 sm:px-8 text-base',
} as const;

/**
 * ✅ BUTTON RADIUS PRESETS
 */
export const BUTTON_RADIUS = {
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  xl: 'rounded-[var(--radius-xl)]',
  full: 'rounded-[var(--radius-full)]',
} as const;