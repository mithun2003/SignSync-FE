# SignSync Frontend Report

## Methodology, Architecture, and System Implementation (Angular 21)

## 1. Frontend Scope

The frontend is a standalone Angular 21 application responsible for:

- User and admin interfaces.
- Real-time webcam interaction for sign detection.
- Text-to-sign educational translation flow.
- Authentication UX and protected navigation.
- Dashboard and settings workflows.

The frontend communicates with the backend through REST (`/api/v1/...`) and WebSocket (`/api/v1/predict/ws`) channels.

---

## 2. Frontend Development Methodology

### 2.1 Iterative Feature Delivery

Frontend features were implemented in vertical increments:

1. Route and layout setup (`user`, `auth`, `admin`).
2. Core services and API integration.
3. AI-assisted detection and translation UX.
4. Admin/analytics surfaces and usability hardening.

This approach ensured each feature was functional end-to-end before moving to the next.

### 2.2 Implementation Principles

- **Standalone component architecture** for modularity and reduced NgModule overhead.
- **Signal-based state management** for highly interactive screens.
- **Route-level access control** using guard functions.
- **Service abstraction** to isolate HTTP and domain logic from component views.
- **Lazy-loaded route partitions** to optimize startup performance.

---

## 3. Frontend Architecture

### 3.1 Layered UI Structure

The frontend architecture uses a feature-oriented layout:

- `core/`: guards, interceptors, foundational services.
- `layouts/`: user/auth/admin shells.
- `pages/`: route-level feature modules (user/auth/admin).
- `shared/`: reusable UI components, alerts, utilities.
- `models/`: typed client-side contracts.

### 3.2 Routing Architecture

- Root routes load child routes from `pages.routes.ts`.
- Major route groups:
  - Public/user pages (`/`, `/gesture-detection`, `/translate`, `/help`, etc.).
  - Auth pages (`/auth/signin`, `/auth/signup`, etc.).
  - Admin pages (`/admin/dashboard`, `/admin/signs`, `/admin/settings`, etc.).
- Access restrictions:
  - `guestGuard` for auth pages,
  - `roleGuard` for protected and admin paths.

### 3.3 State and Change Detection

- Components use `ChangeDetectionStrategy.OnPush`.
- Transient UI state uses `signal`.
- Derived values use `computed`.
- Reactive side effects use `effect`.
- This pattern is heavily used in gesture detection and translation screens.

### 3.4 API and Network Architecture

- `ApiService` centralizes CRUD calls against `${environment.rootUrl}/api/v1`.
- HTTP interceptor:
  - adds bearer access token,
  - excludes auth bootstrap paths,
  - refreshes token on unauthorized responses,
  - clears session if refresh fails.
- WebSocket client in user service opens authenticated connection to prediction stream.

---

## 4. Frontend System Implementation

### 4.1 Bootstrapping and App Configuration

The application is bootstrapped via `bootstrapApplication` with:

- zoneless change detection,
- router providers and view transitions,
- fetch-based `HttpClient`,
- DI-registered auth interceptor.

### 4.2 Authentication UI Flow

- Sign-in captures credentials and submits form payload to login endpoint.
- On success:
  - access token and role are stored locally,
  - user is redirected by role (`/admin` or `/`).
- Signup posts registration fields to auth register endpoint.
- Forgot/reset pages provide recovery UX hooks.

### 4.3 Real-Time Gesture Detection Implementation

The gesture detection component coordinates:

- Camera stream acquisition and lifecycle.
- Hand model preload (MediaPipe Tasks Vision).
- Face emotion model preload for contextual suggestions.
- Overlay rendering of hand landmarks.
- Landmark streaming to backend via WebSocket.
- Stability-based letter confirmation logic:
  - confidence threshold,
  - consecutive-frame stability count,
  - minimum interval between accepted letters.

It also includes:

- sentence construction/editing,
- speech synthesis output,
- emergency phrase support,
- optional help-mail trigger flow.

### 4.4 Text-to-Sign Translation Implementation

The translation page implements:

- input normalization to A–Z and SPACE tokens,
- sequenced playback controls (play/pause/reset/clear),
- speed-adjustable animation loop,
- sign image lookup from backend-provided active sign library,
- progress visualization and letter-level navigation.

### 4.5 Admin Frontend Implementation

Admin service integrations provide interfaces for:

- dashboard summary and report export,
- user management and status controls,
- analytics period queries,
- system health and active user visibility,
- cache/backup actions,
- application settings updates,
- sign library management (through dedicated sign service).

---

## 5. Frontend Non-Functional Design

### 5.1 Performance

- Route lazy loading limits initial bundle cost.
- OnPush + signals reduce unnecessary template recomputation.
- Landmark-based streaming avoids large per-frame image payloads.
- Detection services throttle heavy model operations.

### 5.2 Reliability and UX Safety

- Camera/session cleanup on component teardown and tab visibility changes.
- Guard-based navigation prevents unauthorized route usage.
- Structured loading/error states for user feedback.

### 5.3 Maintainability

- Feature-centric foldering.
- Strongly typed service contracts.
- Shared UI/service utilities to reduce duplication.

---

## 6. Frontend Summary

The SignSync frontend is a modern Angular standalone application designed for high interactivity and low-latency AI workflows. Its architecture combines route-level modularity, signal-driven reactivity, and robust API/WebSocket integration to deliver both user-facing learning experiences and operational admin tooling.
