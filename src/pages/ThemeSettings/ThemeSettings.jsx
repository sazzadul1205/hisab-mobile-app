import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { useTheme, THEMES } from "../../auth/themeContext";
import { Note } from "../../components/Note";

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="App Theme" />

        <SectionLabel className="mt-1">Select Appearance</SectionLabel>

        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-3">
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={
                "w-full flex items-center justify-between px-3.75 py-3.5 " +
                "text-left font-[inherit] bg-(--card) border-0 cursor-pointer " +
                (i < THEMES.length - 1 ? "border-b border-(--line-2)" : "")
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border border-black/10"
                  style={{ backgroundColor: t.color }}
                />
                <span
                  className={`text-[14px] ${theme === t.id ? "font-bold text-(--ink)" : "font-medium text-(--ink-2)"}`}
                >
                  {t.name}
                </span>
              </div>
              {theme === t.id && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 stroke-(--brand) fill-none stroke-[2.5]"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <Note>
          Changing the theme only affects the colors of the app. It does not
          affect your data or encryption.
        </Note>
      </ScrollArea>
    </PhoneFrame>
  );
}
