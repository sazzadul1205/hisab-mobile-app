# /build — Production build

Builds the app for production deployment.

## Usage

```bash
kilo run /build
```

## What it does

- Runs `npm run build` (Vite production build)
- Generates PWA assets and service worker
- Outputs to `dist/`

## Notes

Before building, ensure `npm run lint` and `npm run test:run` pass.