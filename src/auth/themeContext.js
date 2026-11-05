import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);

export const THEMES = [
    // ---- Light themes ----
    { id: "default", name: "Hisab Green", color: "#0E7C5A" },
    { id: "irish", name: "Irish Forest", color: "#15803D" },
    { id: "teal", name: "Teal", color: "#0F766E" },
    { id: "ocean", name: "Ocean Blue", color: "#2563EB" },
    { id: "nord", name: "Nord", color: "#5E81AC" },
    { id: "slate", name: "Slate", color: "#475569" },
    { id: "lavender", name: "Lavender", color: "#7C5CFC" },
    { id: "rose", name: "Rose", color: "#BE123C" },
    { id: "cherry", name: "Cherry", color: "#C2185B" },
    { id: "sunset", name: "Sunset", color: "#D97706" },
    { id: "amber", name: "Amber", color: "#B45309" },
    { id: "sepia", name: "Sepia", color: "#8B6914" },
    { id: "coffee", name: "Coffee", color: "#6F4E37" },

    // ---- Dark themes ----
    { id: "dark", name: "Midnight", color: "#0F172A", dark: true },
    { id: "midnight-blue", name: "Midnight Blue", color: "#1E3A5F", dark: true },
    { id: "plum", name: "Plum", color: "#A855F7", dark: true },
];

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
    return ctx;
}