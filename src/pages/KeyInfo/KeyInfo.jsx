import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { SectionLabel } from "../../components/SectionLabel";
import { Alert } from "../../components/Alert";
import { Note } from "../../components/Note";

function Step({ number, title, body }) {
  return (
    <div className="flex gap-3 items-start py-3 border-b border-(--line-2) last:border-b-0">
      <div className="w-7 h-7 rounded-full bg-(--brand-soft) text-(--brand-dk) flex-none grid place-items-center text-[12px] font-bold">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <b className="block text-[13px] font-semibold tracking-[-0.1px]">
          {title}
        </b>
        <small className="block text-[11.5px] text-(--muted) leading-[1.55] mt-1">
          {body}
        </small>
      </div>
    </div>
  );
}

function DataRow({ label, value, tone = "neutral", last = false }) {
  const toneClass =
    tone === "protected"
      ? "text-(--in)"
      : tone === "visible"
        ? "text-(--warn)"
        : "text-(--ink)";

  return (
    <div
      className={
        "flex items-start justify-between gap-3 py-2.5 " +
        (last ? "" : "border-b border-(--line-2)")
      }
    >
      <span className="text-[12px] text-(--ink-2) flex-1">{label}</span>
      <span className={"text-[11.5px] font-semibold text-right " + toneClass}>
        {value}
      </span>
    </div>
  );
}

export default function KeyInfo() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="Key management" />

        <div
          className="rounded-[18px] p-5 text-white mb-3"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}
        >
          <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-white/70">
            Encryption at rest
          </div>
          <div className="text-[16px] font-bold tracking-[-0.3px] mt-1.5 leading-snug">
            Your records are encrypted with AES-GCM. Without your PIN, they
            cannot be read.
          </div>
        </div>

        <div className="stagger">
          <SectionLabel>How it works</SectionLabel>
          <div className="bg-(--card) border border-(--line) rounded-[18px] px-4 py-1 mb-3">
            <Step
              number="1"
              title="PIN derives a master key"
              body="Your PIN goes through PBKDF2-SHA256 with 600,000 iterations and a random salt. The result is a 32-byte master key."
            />
            <Step
              number="2"
              title="Master key unlocks the DEK"
              body="A second, random 32-byte key — the DEK (Data Encryption Key) — is stored encrypted with the master key. Only your PIN can unwrap it."
            />
            <Step
              number="3"
              title="The DEK encrypts every record"
              body="All account names, transaction amounts, notes, categories, and balances are encrypted with the DEK using AES-GCM before being stored."
            />
          </div>

          <SectionLabel>What is encrypted vs. visible</SectionLabel>
          <div className="bg-(--card) border border-(--line) rounded-[18px] px-4 py-1 mb-3">
          <DataRow
            label="Account names, opening balances"
            value="Encrypted"
            tone="protected"
          />
          <DataRow
            label="Transaction amounts, fees, notes"
            value="Encrypted"
            tone="protected"
          />
          <DataRow label="Category names" value="Encrypted" tone="protected" />
          <DataRow label="Record IDs" value="Visible" tone="visible" />
          <DataRow
            label="Transaction types (income/expense/transfer)"
            value="Visible"
            tone="visible"
          />
          <DataRow
            label="Dates and account IDs"
            value="Visible"
            tone="visible"
          />
          <DataRow
            label="Archived flags and defaults"
            value="Visible"
            tone="visible"
            last
          />
        </div>

        <Note>
          The visible fields let the app sort, filter, and index records. They
          reveal <i>structure</i> — how many transactions, on which dates,
          between which accounts — but not amounts, names, or notes.
        </Note>

        <SectionLabel className="mt-5">Changing your PIN</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
          <p className="m-0 text-[12.5px] leading-[1.65] text-(--ink-2)">
            Changing your PIN re-wraps the DEK with a new master key. It does
            not re-encrypt any records, because the DEK itself never changes.
          </p>
          <div className="h-px bg-(--line-2) my-3" />
          <div className="flex items-start gap-2">
            <span className="text-[11px] font-semibold text-(--muted) uppercase tracking-wider w-20 flex-none">
              Before
            </span>
            <span className="text-[12px] text-(--ink-2)">
              Old PIN → old master key → wraps DEK
            </span>
          </div>
          <div className="flex items-start gap-2 mt-2">
            <span className="text-[11px] font-semibold text-(--muted) uppercase tracking-wider w-20 flex-none">
              After
            </span>
            <span className="text-[12px] text-(--ink-2)">
              New PIN → new master key → wraps the same DEK
            </span>
          </div>
          <div className="h-px bg-(--line-2) my-3" />
          <p className="m-0 text-[12px] leading-[1.6] text-(--muted)">
            This is why PIN changes are instant, even with thousands of records.
          </p>
        </div>

        <SectionLabel>Backups</SectionLabel>
        <div className="bg-(--card) border border-(--line) rounded-[18px] p-4 mb-3">
          <p className="m-0 text-[12.5px] leading-[1.65] text-(--ink-2)">
            Backup files use a <b>separate password</b>, not your PIN. This lets
            you restore a backup on a fresh device with a new PIN — records
            aren't tied to one vault.
          </p>
          <div className="h-px bg-(--line-2) my-3" />
          <p className="m-0 text-[12px] leading-[1.6] text-(--muted)">
            The backup password uses its own PBKDF2 derivation and AES-GCM
            encryption. It is never stored anywhere.
          </p>
        </div>

        <SectionLabel>Honest limitations</SectionLabel>
        <Alert
          tone="warn"
          className="mb-3"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="What this doesn't protect against"
        >
          If someone can run code on your unlocked device — a compromised
          browser, a rooted phone — they can read decrypted data. The PIN
          protects against theft, not against an attacker with full device
          access.
        </Alert>

        <Alert
          tone="info"
          className="mb-3"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </>
          }
          title="Throttle is best-effort"
        >
          After several wrong PIN attempts, the app delays further tries. This
          state is memory-only and resets on reload. The real protection is the
          600,000-iteration PBKDF2 cost, not the throttle.
        </Alert>

        <SectionLabel>Recovery</SectionLabel>
        <Alert
          tone="danger"
          icon={
            <>
              <path d="M12 9v4" />
              <circle cx="12" cy="17" r=".6" fill="currentColor" />
              <path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </>
          }
          title="No PIN recovery"
        >
          There is no backdoor. If you forget your PIN <b>and</b> don't have an
          encrypted backup, your data is unrecoverable. This is deliberate — a
          recovery mechanism would mean the encryption could be bypassed.
        </Alert>
        </div>

        <div className="text-center mt-4 mb-2">
          <span className="text-[11px] text-(--muted)">
            PBKDF2-SHA256 · AES-GCM · Web Crypto API
          </span>
        </div>
      </ScrollArea>
    </PhoneFrame>
  );
}
