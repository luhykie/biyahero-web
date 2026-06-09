# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- Responsive route planning and commute recommendations.
- Budget-aware ride suggestions.
- Place discovery for Cebu landmarks, malls, beaches, and transit terminals.
- Simple onboarding flow with welcome, auth, and main app screens.

## Tech stack

- React 19
- Vite
- Leaflet + React Leaflet for map display
- ESLint for code quality

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Project structure

- `src/` - application source files
- `src/components/` - reusable UI components and screens
- `src/data/` - terminals, transit routes, landmarks, and hero moves content
- `src/services/` - location and routing helpers
- `src/utils/` - app logic, calculations, and history storage
- `public/` - static assets used by the app

## Notes

This repository is currently configured as a private Vite app and does not include backend authentication or real API integration. It is intended as a front-end prototype for Cebu commute planning.
