/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Resolve env vars at build time. The service worker reads these
// placeholders; Vite replaces them during build so the built sw.js
// never contains a literal "" for a missing key.
function env(key) {
    return JSON.stringify(process.env[key] ?? "");
}

export default defineConfig({
  define: {
    // Public sw.js placeholders — replaced by esbuild at build time.
    "__VITE_FIREBASE_API_KEY__": env("VITE_FIREBASE_API_KEY"),
    "__VITE_FIREBASE_APP_ID__": env("VITE_FIREBASE_APP_ID"),
    "__VITE_FIREBASE_PROJECT_ID__": env("VITE_FIREBASE_PROJECT_ID"),
    "__VITE_FIREBASE_STORAGE_BUCKET__": env("VITE_FIREBASE_STORAGE_BUCKET"),
    "__VITE_FIREBASE_MESSAGING_SENDER_ID__": env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    "__VITE_FIREBASE_MEASUREMENT_ID__": env("VITE_FIREBASE_MEASUREMENT_ID"),
    "__VITE_FIREBASE_AUTH_DOMAIN__": env("VITE_FIREBASE_AUTH_DOMAIN"),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectManifest: true,
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Hisab — Personal Finance",
        short_name: "Hisab",
        description:
          "Local-first personal finance & bookkeeping for Bangladesh. BDT only.",
        theme_color: "#0E7C5A",
        background_color: "#EEF2F0",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('dexie')) {
              return 'db';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts';
            }
            if (id.includes('workbox')) {
              return 'pwa';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});