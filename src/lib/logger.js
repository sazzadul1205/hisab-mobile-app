/* ----------------------------------------------------------------
   Minimal logger.

   Uses import.meta.env.DEV (provided by Vite) — true in dev/test,
   false in production builds. Production logs are stripped to a no-op
   at build time by Vite's esbuild pre-bundling.

   Never logs secrets, keys, PINs, or decrypted financial data.
   ---------------------------------------------------------------- */

const noop = () => {};

const enabled = import.meta.env.DEV;

export const logger = {
  error: enabled ? console.error.bind(console) : noop,
  warn: enabled ? console.warn.bind(console) : noop,
};