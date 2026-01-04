/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,ts,css,scss,sass,less}"],
  theme: {
    colors: {
      transparent: "transparent",

      /* Font */
      "font-primary": "var(--color-font-primary)",

      /* Background */
      "bg-primary": "var(--color-bg-primary)",
      "bg-secondary": "var(--color-bg-secondary)",

      /* Neutral */
      "neutral-black": "var(--color-neutral-black)",
      "neutral-grey": "var(--color-neutral-grey)",
      "neutral-silver": "var(--color-neutral-silver)",
      "neutral-white": "var(--color-neutral-white)",

      /* Semantic */
      info: "var(--color-info)",
      success: "var(--color-success-tint-2)",
      danger: "var(--color-red-primary)",

      /* Accents */
      "red-primary": "var(--color-red-primary)",
      "red-secondary": "var(--color-red-secondary)",
      "violet-primary": "var(--color-violet-primary)",
      "violet-secondary": "var(--color-violet-secondary)",

      "purple-primary": "var(--color-purple-primary)",
      "pink-primary": "var(--color-pink-primary)",

      /* Border */
      "border-primary": "var(--color-border-primary)",

      white: "#ffffff",
    },

    extend: {
      fontFamily: {
        manrope: ["var(--font-manrope)"],
        roboto: ["var(--font-roboto)"],
        karla: ["var(--font-karla)"],
      },

      /* ===== SHADOWS ===== */
      boxShadow: {
        "common-button-shadow": "var(--shadow-common-button-shadow)",
        "common-box": "var(--shadow-common-box)",
        "common-tab-bottom": "var(--shadow-common-tab-bottom)",
        "nav-bar": "var(--shadow-nav-bar)",
        button: "var(--shadow-button)",
      },

      /* ===== SPACING (optional, token-based) ===== */
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
      },

      /* ===== BORDER RADIUS ===== */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      screens: {
        laptop: "1100px",
      },

      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },

      fontSize: {
        "headline-1": "var(--font-headline-1)",
        "headline-2": "var(--font-headline-2)",
        "headline-3": "var(--font-headline-3)",
        "body-1": "var(--font-body-1)",
        "body-2": "var(--font-body-2)",
        "body-3": "var(--font-body-3)",
        "body-4": "var(--font-body-4)",
        regular: "var(--font-regular)",
        medium: "var(--font-medium)",
        semibold: "var(--font-semibold)",
      }
    },
  },

  plugins: [],
};
