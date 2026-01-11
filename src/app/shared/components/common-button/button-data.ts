interface ButtonColorTheme {
  text: string;
  bg: string;
  hoverBg: string;
}

/* --------------------------------------------------------------------
   COLOR THEMES (Single Source of Truth)
-------------------------------------------------------------------- */
export const COLOR_THEME_MAP: Record<string, ButtonColorTheme> = {
  violet: {
    text: 'text-white',
    bg: 'bg-violet-primary',
    hoverBg: 'bg-violet-secondary',
  },
  red: {
    text: 'text-white',
    bg: 'bg-red-primary/90',
    hoverBg: 'bg-red-primary',
  },
  green: {
    text: 'text-white',
    bg: 'bg-success-tint-1/90',
    hoverBg: 'bg-success-tint-1',
  },
  white: {
    text: 'text-black',
    bg: 'bg-white',
    hoverBg: 'bg-white/10',
  },
  black: {
    text: 'text-white',
    bg: 'bg-black',
    hoverBg: 'bg-black/20',
  },
};
