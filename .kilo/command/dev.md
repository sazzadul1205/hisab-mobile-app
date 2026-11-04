# /dev — Development server

Starts the Vite dev server with PWA support enabled.

## Usage

```bash
kilo run /dev
```

## What it does

- Starts `vite --host` on the default port (5173)
- Enables PWA service worker in development
- Hot module replacement (HMR) enabled

## Notes

The app is designed to run over HTTPS or localhost for Web Crypto API access. When testing on a physical device, use a tunnel (e.g., Cloudflare Tunnel, ngrok) or serve over HTTPS.