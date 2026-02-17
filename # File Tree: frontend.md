# File Tree: frontend

**Generated:** 2/14/2026, 10:30:29 AM
**Root Path:** `/mnt/fdrive/akshay/SignSync/frontend`

```
├── .angular
├── .github
│   └── copilot-instructions.md
├── .husky
│   ├── _
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   └── pre-commit
├── public
│   ├── favicon.ico
│   └── icon.svg
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── admin-header
│   │   │   │   ├── admin-header.component.html
│   │   │   │   ├── admin-header.component.spec.ts
│   │   │   │   └── admin-header.component.ts
│   │   │   ├── admin-sidebar
│   │   │   │   ├── admin-sidebar.component.html
│   │   │   │   ├── admin-sidebar.component.spec.ts
│   │   │   │   └── admin-sidebar.component.ts
│   │   │   ├── faq
│   │   │   │   ├── faq.component.html
│   │   │   │   ├── faq.component.spec.ts
│   │   │   │   └── faq.component.ts
│   │   │   └── footer
│   │   │       ├── footer.component.html
│   │   │       ├── footer.component.spec.ts
│   │   │       └── footer.component.ts
│   │   ├── core
│   │   │   ├── guards
│   │   │   │   ├── guest.guard.spec.ts
│   │   │   │   ├── guest.guard.ts
│   │   │   │   ├── role.guard.spec.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptor
│   │   │   │   └── authInterceptor.ts
│   │   │   └── services
│   │   │       ├── api
│   │   │       │   ├── api.service.spec.ts
│   │   │       │   └── api.service.ts
│   │   │       ├── common
│   │   │       │   ├── common.service.spec.ts
│   │   │       │   └── common.service.ts
│   │   │       ├── local-storage
│   │   │       │   ├── local-storage.service.spec.ts
│   │   │       │   └── local-storage.service.ts
│   │   │       ├── auth.service.spec.ts
│   │   │       └── auth.service.ts
│   │   ├── layouts
│   │   │   ├── admin-layout
│   │   │   │   ├── admin-layout.component.html
│   │   │   │   ├── admin-layout.component.spec.ts
│   │   │   │   └── admin-layout.component.ts
│   │   │   ├── auth-layout
│   │   │   │   ├── auth-layout.component.html
│   │   │   │   ├── auth-layout.component.spec.ts
│   │   │   │   └── auth-layout.component.ts
│   │   │   ├── navbar
│   │   │   │   ├── nav-links.data.ts
│   │   │   │   ├── navbar.component.css
│   │   │   │   ├── navbar.component.html
│   │   │   │   ├── navbar.component.spec.ts
│   │   │   │   └── navbar.component.ts
│   │   │   └── user-layout
│   │   │       ├── user-layout.component.html
│   │   │       ├── user-layout.component.spec.ts
│   │   │       └── user-layout.component.ts
│   │   ├── models
│   │   │   ├── auth.model.ts
│   │   │   ├── environment.ts
│   │   │   ├── global.model.ts
│   │   │   └── localStorage.ts
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── dashboard.component.html
│   │   │   │   │   ├── dashboard.component.spec.ts
│   │   │   │   │   └── dashboard.component.ts
│   │   │   │   ├── settings
│   │   │   │   │   ├── settings.component.html
│   │   │   │   │   ├── settings.component.spec.ts
│   │   │   │   │   └── settings.component.ts
│   │   │   │   ├── todos
│   │   │   │   │   ├── todos.component.html
│   │   │   │   │   ├── todos.component.spec.ts
│   │   │   │   │   └── todos.component.ts
│   │   │   │   └── admin.routes.ts
│   │   │   ├── auth
│   │   │   │   ├── components
│   │   │   │   │   ├── forgot-password
│   │   │   │   │   │   ├── forgot-password.component.html
│   │   │   │   │   │   ├── forgot-password.component.spec.ts
│   │   │   │   │   │   └── forgot-password.component.ts
│   │   │   │   │   ├── reset-password
│   │   │   │   │   │   ├── reset-password.component.html
│   │   │   │   │   │   ├── reset-password.component.spec.ts
│   │   │   │   │   │   └── reset-password.component.ts
│   │   │   │   │   ├── signin
│   │   │   │   │   │   ├── signin.component.css
│   │   │   │   │   │   ├── signin.component.html
│   │   │   │   │   │   ├── signin.component.spec.ts
│   │   │   │   │   │   └── signin.component.ts
│   │   │   │   │   └── signup
│   │   │   │   │       ├── signup.component.html
│   │   │   │   │       ├── signup.component.spec.ts
│   │   │   │   │       └── signup.component.ts
│   │   │   │   ├── model
│   │   │   │   │   └── auth.model.ts
│   │   │   │   ├── service
│   │   │   │   │   ├── auth-repository.service.ts
│   │   │   │   │   └── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── not-found
│   │   │   │   ├── not-found.component.html
│   │   │   │   ├── not-found.component.spec.ts
│   │   │   │   └── not-found.component.ts
│   │   │   ├── user
│   │   │   │   ├── components
│   │   │   │   │   ├── gesture-detection
│   │   │   │   │   │   ├── gesture-detection.component.css
│   │   │   │   │   │   ├── gesture-detection.component.html
│   │   │   │   │   │   ├── gesture-detection.component.spec.ts
│   │   │   │   │   │   └── gesture-detection.component.ts
│   │   │   │   │   ├── home
│   │   │   │   │   │   ├── features
│   │   │   │   │   │   │   ├── features.component.html
│   │   │   │   │   │   │   ├── features.component.scss
│   │   │   │   │   │   │   ├── features.component.spec.ts
│   │   │   │   │   │   │   └── features.component.ts
│   │   │   │   │   │   ├── hero
│   │   │   │   │   │   │   ├── hero.component.html
│   │   │   │   │   │   │   ├── hero.component.scss
│   │   │   │   │   │   │   ├── hero.component.spec.ts
│   │   │   │   │   │   │   └── hero.component.ts
│   │   │   │   │   │   ├── home.component.html
│   │   │   │   │   │   ├── home.component.spec.ts
│   │   │   │   │   │   └── home.component.ts
│   │   │   │   │   └── translate
│   │   │   │   │       ├── translate.component.css
│   │   │   │   │       ├── translate.component.html
│   │   │   │   │       ├── translate.component.spec.ts
│   │   │   │   │       └── translate.component.ts
│   │   │   │   ├── model
│   │   │   │   │   └── user.model.ts
│   │   │   │   ├── service
│   │   │   │   │   ├── face-detect-service
│   │   │   │   │   │   ├── emotion-word-map.ts
│   │   │   │   │   │   ├── face-detect.service.spec.ts
│   │   │   │   │   │   └── face-detect.service.ts
│   │   │   │   │   ├── hand-detect-service
│   │   │   │   │   │   ├── hand-detect.service.spec.ts
│   │   │   │   │   │   └── hand-detect.service.ts
│   │   │   │   │   └── user-service
│   │   │   │   │       ├── user-repository.service.ts
│   │   │   │   │       ├── user.service.spec.ts
│   │   │   │   │       └── user.service.ts
│   │   │   │   └── user.routes.ts
│   │   │   └── pages.routes.ts
│   │   ├── services
│   │   │   ├── app-settings
│   │   │   │   ├── app-settings.service.spec.ts
│   │   │   │   └── app-settings.service.ts
│   │   │   ├── todos.service.spec.ts
│   │   │   └── todos.service.ts
│   │   ├── shared
│   │   │   ├── alert
│   │   │   │   ├── component
│   │   │   │   │   ├── alert-data.ts
│   │   │   │   │   ├── alert.component.html
│   │   │   │   │   ├── alert.component.scss
│   │   │   │   │   ├── alert.component.spec.ts
│   │   │   │   │   └── alert.component.ts
│   │   │   │   ├── model
│   │   │   │   │   └── alert.model.ts
│   │   │   │   └── service
│   │   │   │       └── alert.service.ts
│   │   │   ├── animations
│   │   │   │   └── router.animation.ts
│   │   │   ├── components
│   │   │   │   └── common-button
│   │   │   │       ├── button-data.ts
│   │   │   │       ├── common-button.component.html
│   │   │   │       ├── common-button.component.scss
│   │   │   │       ├── common-button.component.spec.ts
│   │   │   │       └── common-button.component.ts
│   │   │   ├── service
│   │   │   └── utils
│   │   │       └── speech.util.ts
│   │   ├── app.component.css
│   │   ├── app.component.html
│   │   ├── app.component.spec.ts
│   │   ├── app.component.ts
│   │   ├── app.config.server.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.server.ts
│   │   └── app.routes.ts
│   ├── assets
│   │   ├── images
│   │   │   ├── icon.png
│   │   │   ├── icon.svg
│   │   │   ├── sign_girl.png
│   │   │   └── sign_hand.png
│   │   └── style_variants
│   │       ├── theme
│   │       │   ├── _colors.css
│   │       │   ├── _effects.css
│   │       │   ├── _spacing.css
│   │       │   └── _typography.css
│   │       └── base.css
│   ├── environments
│   │   └── environment.ts
│   ├── index.html
│   ├── main.server.ts
│   ├── main.ts
│   └── styles.css
├── .editorconfig
├── .gitignore
├── .npmrc
├── .postcssrc.json
├── LICENSE
├── README.md
├── angular.json
├── eslint.config.js
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

---
*Generated by FileTree Pro Extension*