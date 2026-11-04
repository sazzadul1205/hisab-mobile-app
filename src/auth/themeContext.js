import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);

export const THEMES = [
    { id: "default", name: "Hisab Green", color: "#0E7C5A" },
    { id: "dark", name: "Midnight", color: "#0F172A" },
    { id: "ocean", name: "Ocean Blue", color: "#2563EB" },
    { id: "irish", name: "Irish Forest", color: "#15803D" },
];

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
    return ctx;
}