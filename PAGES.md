# SignSync — Frontend Pages Reference

A complete reference for every page in the SignSync Angular frontend, including routes, purpose, access level, and key components.

---

## Access Level Key

| Symbol | Meaning                                                    |
| ------ | ---------------------------------------------------------- |
| 🌐     | Public — accessible by everyone                            |
| 🔒     | Protected — requires login (`roleGuard`)                   |
| 👤     | Guest-only — redirects logged-in users away (`guestGuard`) |
| 🛡️     | Admin-only — requires admin role (`roleGuard`)             |

---

## User-Facing Pages

### 🌐 Home

|                    |                                                            |
| ------------------ | ---------------------------------------------------------- |
| **Route**          | `/` (also `/home` → redirects here)                        |
| **Component**      | `src/app/pages/user/components/home/home.component.ts`     |
| **Sub-components** | `hero/hero.component.ts`, `features/features.component.ts` |

The public landing page. Split into two sections:

- **Hero** — headline with gradient animated title, CTA buttons to Detect and Translate, live stats (accuracy, letter count, real-time badge), animated floating feature cards, and decorative particle system.
- **Features** — "What is Sign Language?" explainer with Learn / Practice / Test cards, main feature list (real-time recognition, intuitive UI, adaptive learning, high accuracy), "How It Works" step-by-step visual with a connecting timeline, and a CTA banner with shimmer effect.

---

### 🌐 Gesture Detection (Sign → Text)

|               |                                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| **Route**     | `/gesture-detection`                                                             |
| **Component** | `src/app/pages/user/components/gesture-detection/gesture-detection.component.ts` |

The core real-time ASL-to-text feature. Key capabilities:

- Live webcam feed with MediaPipe hand-landmark overlay drawn on a canvas
- Stability ring (SVG progress circle) shows how long the current sign has been held
- Confidence bar and percentage display for the active prediction
- Sentence builder — letters accumulate into a scrollable sentence area; click any letter to remove it
- Special gestures: `SPACE` inserts a word boundary (shown as `·`), `DEL` removes the last character (shown as `⌫` in red)
- Quick actions: Add Space, Backspace, Add Period, Add `?`
- Recent letters history strip (last 10, scrollable)
- Emotion & Suggestions panel — face detection infers current mood; AI word suggestions appear based on the current letter
- Settings: auto-space on pause, voice feedback toggle, reading speed slider (0.5×–1.5×)
- Logged-out state shows a locked-screen prompt with Sign In / Create Account CTAs

---

### 🌐 Text to Sign Translation (Text → Sign)

|               |                                                                  |
| ------------- | ---------------------------------------------------------------- |
| **Route**     | `/translate`                                                     |
| **Component** | `src/app/pages/user/components/translate/translate.component.ts` |

Converts typed text into a sequential display of ASL sign images:

- Textarea input for any text (non-A–Z characters are skipped automatically)
- Play / Pause / Reset / Clear controls
- Animation speed slider (500 ms – 3 000 ms per sign)
- Letter sequence strip — click any letter to jump directly to that sign
- Sign image panel — displays the current ASL image with fade transition; shows a spinner while loading
- Large current-letter display with progress bar (% complete)
- "Your Message" preview box showing the full original text
- "How to Use" instructions card
- Logged-out state shows a locked-screen prompt

---

### 🔒 User Dashboard

|               |                                                                  |
| ------------- | ---------------------------------------------------------------- |
| **Route**     | `/dashboard`                                                     |
| **Guard**     | `roleGuard`                                                      |
| **Component** | `src/app/pages/user/components/dashboard/dashboard.component.ts` |

Personal activity overview for logged-in users:

- Stats cards (total letters signed, words built, sessions, etc.)
- Recent activity feed
- Quick-action shortcuts to Gesture Detection and Translate

---

### 🔒 Profile

|               |                                              |
| ------------- | -------------------------------------------- |
| **Route**     | `/profile`                                   |
| **Guard**     | `roleGuard`                                  |
| **Component** | `src/app/pages/profile/profile.component.ts` |

Shared profile page used by both users and admin:

- Display name, email, avatar
- Account details and joined date
- Edit profile form

---

### 🔒 User Settings

|               |                                                                |
| ------------- | -------------------------------------------------------------- |
| **Route**     | `/settings`                                                    |
| **Guard**     | `roleGuard`                                                    |
| **Component** | `src/app/pages/user/components/settings/settings.component.ts` |

User-level preferences:

- Theme selector (dark / light / system)
- Notification preferences
- Account management options

---

### 🌐 Help & Support

|               |                                                        |
| ------------- | ------------------------------------------------------ |
| **Route**     | `/help`                                                |
| **Component** | `src/app/pages/user/components/help/help.component.ts` |

Fully public documentation page:

- **Hero** — branded header with a Contact Support CTA
- **Getting Started** — 3-step cards (allow camera → sign letters → build & share)
- **Key Features** — 6-card grid covering gesture detection, translation, voice feedback, AI suggestions, editable sentence, offline AI
- **Tips for Better Detection** — 4 practical tips (lighting, hand position, steadiness, background)
- **FAQ** — 7 accordion questions (supports, space/delete gestures, detection troubleshooting, reading speed, copy/share, AI suggestions)
- **Contact card** — glass-morphism CTA with email mailto link

---

## Auth Pages

All auth pages use `AuthLayoutComponent` (no navbar/sidebar) and are protected by `guestGuard` — logged-in users are redirected away.

### 👤 Sign In

|               |                                                            |
| ------------- | ---------------------------------------------------------- |
| **Route**     | `/auth/signin`                                             |
| **Component** | `src/app/pages/auth/components/signin/signin.component.ts` |

Email + password login form with JWT response handling. Links to Sign Up and Forgot Password.

---

### 👤 Sign Up

|               |                                                            |
| ------------- | ---------------------------------------------------------- |
| **Route**     | `/auth/signup`                                             |
| **Component** | `src/app/pages/auth/components/signup/signup.component.ts` |

Registration form (name, email, password, confirm password). On success, redirects to Sign In.

---

### 👤 Forgot Password

|               |                                                                              |
| ------------- | ---------------------------------------------------------------------------- |
| **Route**     | `/auth/forgot-password`                                                      |
| **Component** | `src/app/pages/auth/components/forgot-password/forgot-password.component.ts` |

Sends a password-reset email. Single email input with submission feedback.

---

### 👤 Reset Password

|               |                                                                            |
| ------------- | -------------------------------------------------------------------------- |
| **Route**     | `/auth/reset-password`                                                     |
| **Component** | `src/app/pages/auth/components/reset-password/reset-password.component.ts` |

Accepts a reset token (from URL params) and new password / confirm password fields.

---

## Admin Pages

All admin pages use `AdminLayoutComponent` (sidebar + admin header) and require admin role via `roleGuard`.

### 🛡️ Admin Dashboard

|               |                                                                   |
| ------------- | ----------------------------------------------------------------- |
| **Route**     | `/admin` → redirects to `/admin/dashboard`                        |
| **Route**     | `/admin/dashboard`                                                |
| **Component** | `src/app/pages/admin/components/dashboard/dashboard.component.ts` |

System-level overview:

- Stat cards (total users, active sessions, signs uploaded, etc.) with percentage change badges
- Live activity feed
- Charts (usage over time, letter distribution)
- Quick-action grid (manage signs, view todos, settings)

---

### 🛡️ Sign Management

|               |                                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| **Route**     | `/admin/signs`                                                                |
| **Component** | `src/app/pages/admin/components/sign-management/sign-management.component.ts` |

CRUD interface for ASL sign images used by the Translate page:

- Data table listing all signs (letter, image preview, upload date)
- Upload new sign images
- Delete / replace existing signs

---

### 🛡️ Todos

|               |                                                                         |
| ------------- | ----------------------------------------------------------------------- |
| **Route**     | `/admin/todos`                                                          |
| **Component** | `src/app/pages/admin/components/todos/todos.component.ts` (lazy-loaded) |

Internal task tracker for the admin team:

- Create, complete, and delete todos
- Status filtering (pending / in progress / done)

---

### 🛡️ Admin Settings

|               |                                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| **Route**     | `/admin/settings`                                                             |
| **Component** | `src/app/pages/admin/components/settings/settings.component.ts` (lazy-loaded) |

Application-wide configuration:

- General app settings (name, description, maintenance mode)
- Security settings (session timeout, rate limiting)
- Email / notification settings
- Appearance & theme defaults
- Danger zone (reset to defaults, data management)

---

### 🛡️ Admin Profile

|               |                                                                 |
| ------------- | --------------------------------------------------------------- |
| **Route**     | `/admin/profile`                                                |
| **Guard**     | `roleGuard`                                                     |
| **Component** | `src/app/pages/profile/profile.component.ts` (shared with user) |

Same profile component as the user profile, rendered inside the admin layout.

---

## Special Pages

### 🌐 Legal

|               |                                                           |
| ------------- | --------------------------------------------------------- |
| **Route**     | `/legal/:section` (e.g. `/legal/privacy`, `/legal/terms`) |
| **Route**     | `/legal` → redirects to `/legal/privacy`                  |
| **Component** | `src/app/components/legal/legal.component.ts`             |

Privacy policy and Terms of service. The `:section` param controls which document is shown.

---

### 🌐 404 Not Found

|               |                                                                |
| ------------- | -------------------------------------------------------------- |
| **Route**     | `**` (wildcard — catches all unmatched routes)                 |
| **Component** | `src/app/pages/not-found/not-found.component.ts` (lazy-loaded) |

Dark-themed error page with:

- Gradient `404` display
- "Page Not Found" heading and friendly message
- Back to Home (`common-login-button`) and Go Back (outline) buttons
- Quick links to Dashboard, Translate, Detect, and Help
