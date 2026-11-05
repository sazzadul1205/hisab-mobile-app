# /preview — Preview production build

Builds and serves the production bundle locally.

## Usage

```bash
kilo run /preview
```

## What it does

- Runs `npm run build` (Vite production build)
- Runs `npm run preview` (serves the `dist/` output)
- Available at the printed localhost URL

## Notes

- The preview server must serve over HTTPS for Web Crypto API access (or use localhost)
- Use this to verify the production build works before deploying
- Ensure `npm run lint` and `npm run test:run` pass before previewing