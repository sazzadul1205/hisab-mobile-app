import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { useTheme, THEMES } from "../../auth/themeContext";
import { Note } from "../../components/Note";

function ThemeRow({ theme, active, onSelect, isLast }) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={
        "w-full flex items-center justify-between px-3.75 py-3.5 " +
        "text-left font-[inherit] bg-(--card) border-0 cursor-pointer " +
        (isLast ? "" : "border-b border-(--line-2)")
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border border-black/10"
          style={{ backgroundColor: theme.color }}
        />
        <span
          className={`text-[14px] ${
            active ? "font-bold text-(--ink)" : "font-medium text-(--ink-2)"
          }`}
        >
          {theme.name}
        </span>
      </div>
      {active && (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 stroke-(--brand) fill-none stroke-[2.5]"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  );
}

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const light = THEMES.filter((t) => !t.dark);
  const dark = THEMES.filter((t) => t.dark);

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="App Theme" />

        <SectionLabel className="mt-1">Light</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-3">
          {light.map((t, i) => (
            <ThemeRow
              key={t.id}
              theme={t}
              active={theme === t.id}
              onSelect={setTheme}
              isLast={i === light.length - 1}
            />
          ))}
        </div>

        <SectionLabel>Dark</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] overflow-hidden mb-3">
          {dark.map((t, i) => (
            <ThemeRow
              key={t.id}
              theme={t}
              active={theme === t.id}
              onSelect={setTheme}
              isLast={i === dark.length - 1}
            />
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
