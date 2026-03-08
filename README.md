# SignSync — AI-Powered Sign Language Platform

> Real-time ASL fingerspelling recognition, text-to-sign translation, and voice feedback — all running in the browser.

## Overview

SignSync is a full-stack web application that bridges the communication gap between sign language users and non-sign language users. The frontend is an Angular 21 single-page application that uses MediaPipe hand-landmark detection and a custom ML model to recognise American Sign Language (ASL) letters in real time via the device camera, convert them into text, and translate written text back into animated sign images.

---

## Features

- **Real-time gesture detection** — MediaPipe hand-landmark model detects ASL letters (A–Z + SPACE + DEL) with ≥ 90 % confidence threshold
- **Text-to-sign translation** — Animated letter-by-letter display of ASL sign images with adjustable playback speed
- **Voice feedback** — Browser Speech Synthesis reads each detected letter and full sentences aloud, with a speed slider
- **AI word suggestions** — Predicted words appear as you sign, appended with one tap
- **Editable sentence builder** — Click any letter to remove it; backspace, space, period, and question mark quick-action buttons
- **Emotion detection** — Face detection service infers mood and surfaces context-aware word suggestions
- **Dark theme design system** — Tailwind v4 with a full token-based theme (colors, typography, effects) for consistent UI
- **Admin portal** — Dashboard, sign management, todos, and settings for admin users
- **Auth** — JWT-based sign-in / sign-up / forgot-password / reset-password flow

---

## Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Framework     | Angular 21 (standalone components, signals, zoneless) |
| Styling       | Tailwind CSS v4 with custom design token system       |
| AI / CV       | MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)    |
| HTTP          | Angular `HttpClient` with `withFetch()`               |
| UI components | Angular Material, Font Awesome                        |
| Charts        | Chart.js                                              |
| Auth          | JWT (via HTTP interceptor + `crypto-js`)              |
| Build         | Angular CLI (`ng build`)                              |
| SSR           | `@angular/ssr` (optional)                             |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
# or
ng serve
```

Open [http://localhost:4200](http://localhost:4200). The app hot-reloads on file changes.

### Production build

```bash
npm run build
```

Artifacts are written to `dist/signsync/`.

### Linting

```bash
npm run lint
```

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── index.html
│   ├── main.ts                        ← Bootstrap (zoneless + provideRouter)
│   ├── styles.css                     ← Global Tailwind entry + font imports
│   │
│   ├── assets/
│   │   ├── images/                    ← Logos, hero images, sign hand photos
│   │   ├── gestures/                  ← ASL sign images (A.jpg … Z.jpg, space.jpg)
│   │   └── style_variants/            ← Design token system
│   │       ├── base.css               ← Tailwind @theme mappings
│   │       └── theme/
│   │           ├── _colors.css        ← Color tokens + gradient-text, glass utilities
│   │           ├── _typography.css    ← headline-*, body-* utility classes
│   │           ├── _spacing.css       ← Spacing, radius, card tokens
│   │           └── _effects.css       ← Animations, card-hover, glow, shimmer
│   │
│   └── app/
│       ├── app.component.ts           ← Root shell
│       ├── app.config.ts              ← provideRouter, provideZonelessChangeDetection, provideHttpClient
│       ├── app.routes.ts              ← Top-level lazy route loader
│       │
│       ├── core/
│       │   ├── guards/
│       │   │   ├── auth.guard.ts
│       │   │   ├── role.guard.ts      ← Protects /dashboard, /profile, /settings, /admin/*
│       │   │   └── guest.guard.ts     ← Redirects logged-in users away from /auth/*
│       │   ├── interceptor/           ← JWT attach + error handling
│       │   └── services/
│       │       ├── api/               ← Base HTTP service
│       │       ├── common/            ← Global loading/error state
│       │       ├── local-storage/     ← Token persistence
│       │       └── theme/             ← Light/dark/system theme switcher
│       │
│       ├── layouts/
│       │   ├── user-layout/           ← Navbar + router-outlet for public/user pages
│       │   ├── auth-layout/           ← Minimal layout for login/signup
│       │   └── admin-layout/          ← Sidebar + admin header for /admin/*
│       │
│       ├── components/                ← App-wide shared page components
│       │   ├── admin-header/
│       │   ├── admin-sidebar/
│       │   ├── faq/
│       │   ├── footer/
│       │   └── legal/                 ← Privacy policy / Terms of service
│       │
│       ├── shared/
│       │   ├── alert/                 ← Global toast/alert service + component
│       │   ├── animations/            ← Reusable Angular animation triggers
│       │   ├── components/
│       │   │   └── common-button/     ← Reusable button (primary, outline, ghost, red, green…)
│       │   ├── service/               ← Shared utility services
│       │   └── utils/
│       │       └── speech.util.ts     ← speakText() wrapper for SpeechSynthesis API
│       │
│       ├── models/                    ← Shared TypeScript interfaces / types
│       │
│       ├── services/
│       │   └── app-settings/          ← Application-level settings service
│       │
│       └── pages/
│           ├── pages.routes.ts        ← Lazy-loads user, auth, admin route groups
│           │
│           ├── not-found/             ← 404 page
│           ├── profile/               ← Shared profile page (user + admin)
│           │
│           ├── auth/
│           │   ├── auth.routes.ts
│           │   ├── components/
│           │   │   ├── signin/
│           │   │   ├── signup/
│           │   │   ├── forgot-password/
│           │   │   └── reset-password/
│           │   ├── model/             ← Auth request/response DTOs
│           │   └── service/           ← AuthService + AuthRepositoryService
│           │
│           ├── user/
│           │   ├── user.routes.ts
│           │   ├── components/
│           │   │   ├── home/          ← Landing page (hero + features sub-components)
│           │   │   ├── gesture-detection/  ← Real-time sign → text
│           │   │   ├── translate/     ← Text → animated sign images
│           │   │   ├── dashboard/     ← User stats + activity
│           │   │   ├── settings/      ← User preferences
│           │   │   └── help/          ← Help & Support (FAQ, tips, contact)
│           │   ├── model/             ← User DTOs
│           │   └── service/
│           │       ├── user-service/  ← UserService + prediction result signal
│           │       ├── hand-detect-service/   ← MediaPipe hand landmark + prediction
│           │       └── face-detect-service/   ← MediaPipe face detection + emotion map
│           │
│           └── admin/
│               ├── admin.routes.ts
│               ├── components/
│               │   ├── dashboard/     ← Admin stats, charts, recent activity
│               │   ├── sign-management/  ← CRUD for ASL sign images
│               │   ├── todos/         ← Admin task tracker
│               │   └── settings/      ← App-wide configuration
│               ├── models/            ← Admin DTOs
│               └── services/          ← AdminService + SignService
```

---

## Design System

All design tokens live in `src/assets/style_variants/`. Components import theme utilities instead of hardcoded Tailwind colors.

| Token category  | Example classes                                                                              |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Backgrounds** | `bg-bg-primary`, `bg-bg-card`, `bg-bg-secondary`, `bg-bg-hover`                              |
| **Borders**     | `border-border-primary`, `border-border-secondary`, `border-border-muted`                    |
| **Text**        | `text-white`, `text-font-primary`, `text-font-secondary`, `text-font-muted`                  |
| **Brand**       | `text-primary`, `bg-primary`, `bg-primary/15`                                                |
| **Semantic**    | `text-success`, `text-danger`, `text-warning`, `text-info`                                   |
| **Typography**  | `headline-1/2/3`, `body-1/2/3/4`, `-semibold`, `-medium` variants                            |
| **Effects**     | `gradient-text`, `glass`, `card-hover`, `card-hover-lift`, `animate-fade-in`, `animate-glow` |

---

## Pages

See **[PAGES.md](./PAGES.md)** for a full breakdown of every page, its route, purpose, and access level.

---

## Environment

API base URL is configured in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000",
};
```

---

## Angular CLI Reference

| Command                        | Description                  |
| ------------------------------ | ---------------------------- |
| `ng serve`                     | Dev server at localhost:4200 |
| `ng build`                     | Production build → `dist/`   |
| `ng generate component <name>` | Scaffold a new component     |
| `ng lint`                      | Run ESLint                   |

Full CLI docs: [angular.dev/tools/cli](https://angular.dev/tools/cli)

```
signsync/
│
├── .cursor/
├── .github/
├── .vscode/
├── public/
│   └── favicon.ico          ← Replace with your logo.ico
│
├── src/
│   │   index.html
│   │   main.ts
│   │   main.server.ts
│   │   styles.css           ← Global Tailwind base styles
│   │   server.ts            ← Optional: keep if using Express backend later
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   └── logo/
│   │   │       ├── logo.png         ← Your Figma logo (PNG/SVG)
│   │   │       └── logo.svg         ← (Optional, preferred)
│   │   │
│   │   └── gestures/                ← Static gesture images (A.jpg, B.jpg, hello.jpg...)
│   │       ├── A.jpg
│   │       ├── B.jpg
│   │       ├── 1.jpg
│   │       └── ...
│   │
│   ├── app/
│   │   │   app.component.html
│   │   │   app.component.ts
│   │   │   app.config.ts
│   │   │   app.routes.ts            ← Main routes (lazy-loaded modules)
│   │   │
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts    ← Protect /detect, /dashboard etc.
│   │   │   │
│   │   │   └── services/
│   │   │       ├── api.service.ts   ← HTTP calls to FastAPI (gesture detection, translate)
│   │   │       └── auth.service.ts  ← Login, JWT, user state
│   │   │
│   │   ├── layouts/
│   │   │   ├── auth-layout/         ← For login/signup pages (no header/sidebar)
│   │   │   │   └── auth-layout.component.ts
│   │   │   │
│   │   │   └── main-layout/         ← For Home/Detect/Translate/Dashboard (with navbar)
│   │   │       └── main-layout.component.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── ui-button/
│   │   │   │   │   └── ui-button.component.ts
│   │   │   │   │
│   │   │   │   ├── ui-card/
│   │   │   │   │   └── ui-card.component.ts
│   │   │   │   │
│   │   │   │   ├── ui-loader/
│   │   │   │   │   └── ui-loader.component.ts
│   │   │   │   │
│   │   │   │   └── webcam-viewer/   ← Reusable camera component for /detect
│   │   │   │       └── webcam-viewer.component.ts
│   │   │   │
│   │   │   └── pipes/
│   │   │       └── confidence.pipe.ts  ← e.g., 0.94 → "94%"
│   │   │
│   │   ├── features/                ← Lazy-loaded feature modules (optional) or just folders
│   │   │   ├── auth/
│   │   │   │   ├── signin/
│   │   │   │   │   └── signin.component.ts
│   │   │   │   │
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   ├── home/
│   │   │   │   └── home.component.ts
│   │   │   │
│   │   │   ├── detect/
│   │   │   │   └── detect.component.ts     ← Real-time camera + MediaPipe + send landmarks
│   │   │   │
│   │   │   ├── translate/
│   │   │   │   └── translate.component.ts  ← Input text → show image
│   │   │   │
│   │   │   └── dashboard/
│   │   │       └── dashboard.component.ts   ← Stats, history table
│   │   │
│   │   └── models/
│   │       ├── auth.model.ts
│   │       ├── gesture.model.ts    ← { gesture: string, confidence: number, timestamp: Date }
│   │       └── translate.model.ts  ← { text: string, imageUrl: string }
│   │
│   └── environments/
│       └── environment.ts          ← apiUrl: 'http://localhost:8000'
│
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
└── tsconfig.json
```
