import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { BottomNav } from "../../components/BottomNav";

const RELEASES = [
  {
    version: "1.0.1",
    date: "2026-11-04",
    changes: [
      { type: "Changed", items: [
        "Added a shared animation system in src/index.css (6 keyframes plus a "
        + ".stagger cascade utility, gated by prefers-reduced-motion)",
        "Buttons now scale down on press (active:scale-[0.96]) for tactile feedback",
        "Wrapped content blocks in 21 page components with the stagger animation "
        + "so lists, cards, and sections cascade in on mount instead of appearing all at once",
        "Fixed a pre-existing duplicate ScrollArea import in UserManual.jsx that "
        + "broke production builds",
        "Removed an unused TYPE_COLOR constant from this page",
      ]},
      { type: "Security", items: [
        "Added dev-dist to the ESLint ignore list so generated PWA "
        + "service-worker files no longer fail npm run lint",
      ]},
    ],
  },
  {
    version: "1.0.0",
    date: "2026-11-04",
    changes: [
      { type: "Added", items: [
        "Initial public release",
        "Local-first personal finance PWA for Bangladesh (BDT only)",
        "Two-layer encryption: PBKDF2-SHA256 master key + AES-GCM DEK",
        "Account management (Cash, Mobile wallet, Bank, Other)",
        "Income, expense, and transfer transactions with fee handling",
        "Dashboard with combined balance, weekly chart, category breakdown",
        "CSV import for bKash and bank statements with duplicate detection",
        "Encrypted backup (.hisab) and plaintext CSV export",
        "Reconciliation records per account",
        "Auto-lock with configurable inactivity timeout",
        "PIN setup flow with weak-PIN warning",
        "Delete-all with PIN re-authentication and typed confirmation",
        "PWA manifest, service worker, and iOS home screen support",
        "162 passing tests across 13 test files",
      ]},
      { type: "Security", items: [
        "All financial data encrypted at rest with AES-GCM",
        "DEK stored in memory only; zeroed on lock",
        "No PIN recovery backdoor — lost PIN requires encrypted backup",
        "Backup password independent of PIN",
        "Failed-attempt throttle with escalating delays",
        "Content Security Policy header in production builds",
        "Production console.error stripped via import.meta.env.DEV",
      ]},
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-20",
    changes: [
      { type: "Added", items: [
        "Project scaffolding with Vite, React 19, Tailwind CSS v4",
        "Dexie schema and seed default categories",
        "Vault setup, unlock, and change PIN flows",
        "Route guards (RequireAuth, RequireNoVault, RequireVaultLocked)",
        "Basic dashboard with balance card and quick actions",
      ]},
    ],
  },
  {
    version: "0.0.1",
    date: "2026-10-05",
    changes: [
      { type: "Added", items: [
        "Initial commit",
        "README, architecture docs, and SRS acceptance criteria",
      ]},
    ],
  },
];

function Release({ version, date, changes }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className="text-[18px] font-bold tracking-[-0.3px] text-(--ink)">
          {version}
        </span>
        <span className="text-[12px] font-semibold text-(--muted)">
          {date}
        </span>
      </div>

      {changes.map((section, si) => (
        <div key={si} className={si > 0 ? "mt-3" : ""}>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted) mb-1.5 ml-1">
            {section.type}
          </div>
          <div className="bg-(--card) border border-(--line) rounded-[14px] px-3.5 py-1">
            {section.items.map((item, ii) => (
              <div
                key={ii}
                className={
                  "flex gap-2.5 py-1.5 " +
                  (ii < section.items.length - 1 ? "border-b border-(--line-2)" : "")
                }
              >
                <span
                  className={
                    "flex-none w-1.5 h-1.5 rounded-full mt-1.5 " +
                    (section.type === "Added" ? "bg-(--in)" :
                     section.type === "Changed" ? "bg-(--brand)" :
                     section.type === "Fixed" ? "bg-(--out)" :
                     section.type === "Security" ? "bg-(--warn)" :
                     "bg-(--muted)")
                  }
                />
                <span className="text-[12.5px] leading-[1.6] text-(--ink-2)">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Changelog() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Changelog" />

        <div className="rounded-[18px] p-5 text-white mb-5 mt-1"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/70">
            Version History
          </div>
          <div className="text-[16px] font-bold tracking-[-0.3px] mt-1 leading-snug">
            What changed in each release.
          </div>
        </div>

        <div className="pb-4 stagger">
          {RELEASES.map((r) => (
            <Release key={r.version} {...r} />
          ))}
        </div>

        <div className="text-center mt-3 mb-2">
          <span className="text-[11px] text-(--muted)">
            Format: Keep a Changelog · Hisab v1.0.1
          </span>
        </div>
      </ScrollArea>
      <BottomNav active="settings" />
    </PhoneFrame>
  );
}