# SignDetection

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

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