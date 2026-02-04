interface ButtonColorTheme {
  // Filled
  text: string;
  bg: string;
  hoverBg: string;

  // Outline
  outlineText: string;
  outlineBorder: string;
  outlineHoverBg: string;
}


/* --------------------------------------------------------------------
   COLOR THEMES (Single Source of Truth)
-------------------------------------------------------------------- */
export const COLOR_THEME_MAP: Record<string, ButtonColorTheme> = {
  violet: {
    text: 'text-white',
    bg: 'bg-violet-primary',
    hoverBg: 'bg-violet-secondary',

    outlineText: 'text-white',
    outlineBorder: 'border-violet-secondary',
    outlineHoverBg: 'bg-violet-secondary/20',
  },

  red: {
    text: 'text-white',
    bg: 'bg-red-primary/90',
    hoverBg: 'bg-red-primary',

    outlineText: 'text-red-primary',
    outlineBorder: 'border-red-primary',
    outlineHoverBg: 'bg-red-primary/10',
  },

  green: {
    text: 'text-white',
    bg: 'bg-success-tint-1/90',
    hoverBg: 'bg-success-tint-1',

    outlineText: 'text-success-shade-3',
    outlineBorder: 'border-success-shade-3',
    outlineHoverBg: 'bg-success-shade-3/10',
  },

  white: {
    // FILLED WHITE (used on dark backgrounds)
    text: 'text-black',
    bg: 'bg-white',
    hoverBg: 'bg-neutral-silver',

    // OUTLINE WHITE (used on dark backgrounds)
    outlineText: 'text-white',
    outlineBorder: 'border-white',
    outlineHoverBg: 'bg-white/10',
  },

  black: {
    text: 'text-white',
    bg: 'bg-black',
    hoverBg: 'bg-black/80',

    outlineText: 'text-black',
    outlineBorder: 'border-black',
    outlineHoverBg: 'bg-black/10',
  },
};

