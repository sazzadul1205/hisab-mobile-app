import {
    defineConfig,
    minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
    preset: {
        ...minimal2023Preset,
        // Brand color for solid fills and transparent backgrounds
        // on generated PNGs. Matches theme-color in index.html and
        // the manifest.
        brandColor: "#0E7C5A",
        backgroundColor: "#EEF2F0",
        // The defaults give maskable/apple icons ~10% internal padding,
        // which is fine — our content is already inside the safe zone.
        // Raising this to 0.15 for extra safety on aggressive Android masks
        // (Samsung One UI, some Xiaomi ROMs).
        maskable: {
            ...minimal2023Preset.maskable,
            padding: 0.15,
        },
        apple: {
            ...minimal2023Preset.apple,
            padding: 0.15,
        },
    },
    images: ["public/icon.svg"],
});