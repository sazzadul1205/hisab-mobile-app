import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { AppBar } from "../../components/AppBar";
import { BottomNav } from "../../components/BottomNav";
import { ScrollArea } from "../../components/PhoneFrame";

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="m-0 mb-2 text-[13px] font-bold tracking-[0.02em] uppercase text-(--brand)">
        {title}
      </h3>
      <div className="text-[13px] leading-[1.7] text-(--ink-2) space-y-2">
        {children}
      </div>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="ml-4 list-disc text-[13px] leading-[1.7] text-(--ink-2)">
      {children}
    </li>
  );
}

export default function UserManual() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <AppBar title="User Manual" />

        <div className="rounded-[18px] p-5 text-white mb-5 mt-1"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/70">
            Hisab Guide
          </div>
          <div className="text-[16px] font-bold tracking-[-0.3px] mt-1 leading-snug">
            Everything you need to know in a few minutes.
          </div>
        </div>

        <Section title="Your data stays on your device">
          <p className="m-0">
            Hisab stores all your financial data locally in your browser.
            There is no account, no cloud sync, and no tracking. Your data
            is encrypted with your PIN — even the app can't read it without
            you.
          </p>
        </Section>

        <Section title="Getting started">
          <ol className="m-0 pl-4 space-y-1.5">
            <Bullet>Set a 6-digit PIN on first launch.</Bullet>
            <Bullet>Add your first account — cash, bKash, Nagad, or a bank.</Bullet>
            <Bullet>Record income and expenses as they happen.</Bullet>
          </ol>
        </Section>

        <Section title="Adding transactions">
          <Bullet>
            <b>Income</b> — money coming in. Increases the account balance.
          </Bullet>
          <Bullet>
            <b>Expense</b> — money going out. Decreases the account balance.
            The app checks that the account has enough funds.
          </Bullet>
          <Bullet>
            <b>Transfer</b> — move money between two accounts. Any transfer
            fee is debited from the source and counted as an expense.
          </Bullet>
        </Section>

        <Section title="Understanding the dashboard">
          <Bullet>
            <b>Combined balance</b> — total across all active accounts.
          </Bullet>
          <Bullet>
            <b>Today's flow</b> — income, expenses, and net for today.
          </Bullet>
          <Bullet>
            <b>Weekly chart</b> — 7-day income vs. expenses.
          </Bullet>
          <Bullet>
            <b>Expense breakdown</b> — top spending categories this month.
          </Bullet>
          <Bullet>
            <b>Recent activity</b> — your last few transactions.
          </Bullet>
        </Section>

        <Section title="Importing statements">
          <Bullet>
            Supported formats: bKash, bank debit/credit, and generic
            date/amount CSVs.
          </Bullet>
          <Bullet>
            The parser flags duplicates and invalid rows — nothing is
            committed until you review.
          </Bullet>
          <Bullet>
            Category suggestions are auto-generated from keywords but
            always require your confirmation.
          </Bullet>
        </Section>

        <Section title="Backup &amp; restore">
          <Bullet>
            Backups are encrypted with a password you choose — independent
            of your PIN.
          </Bullet>
          <Bullet>
            A backup lets you recover your data on a new device or after
            clearing browser data.
          </Bullet>
          <Bullet>
            Restore can <b>replace</b> all data or <b>merge</b> only new
            records.
          </Bullet>
        </Section>

        <Section title="Security">
          <Bullet>
            Your PIN is never stored. It's run through PBKDF2 (600,000
            iterations) to derive a key each time you unlock.
          </Bullet>
          <Bullet>
            All records are encrypted with AES-GCM. Each record uses its
            own random IV, so identical transactions look different.
          </Bullet>
          <Bullet>
            The app locks after a period of inactivity. You can change the
            timeout in Settings.
          </Bullet>
          <Bullet>
            Wrong PIN attempts are throttled with escalating delays.
          </Bullet>
          <Bullet>
            <b>There is no PIN recovery.</b> If you forget your PIN and
            don't have an encrypted backup, your data is permanently
            unrecoverable. This is deliberate.
          </Bullet>
        </Section>

        <Section title="Troubleshooting">
          <Bullet>
            <b>App won't load over HTTP?</b> Web Crypto requires HTTPS or
            localhost. Use a tunnel or open via{" "}
            <code>http://localhost:5173</code>.
          </Bullet>
          <Bullet>
            <b>Forgot PIN?</b> Restore from an encrypted backup. There is
            no other recovery path.
          </Bullet>
          <Bullet>
            <b>Import failed?</b> Ensure the file is a CSV with date and
            amount columns. Keep it under 10 MB.
          </Bullet>
          <Bullet>
            <b>Data disappeared?</b> Check Settings &gt; Storage. If you
            cleared browser data, restore from a backup.
          </Bullet>
        </Section>

        <div className="text-center mt-6 mb-3">
          <span className="text-[11px] text-(--muted)">
            Hisab v1.0 · BDT only · offline-ready · PBKDF2-SHA256 · AES-GCM
          </span>
        </div>
      </ScrollArea>
      <BottomNav active="settings" />
    </PhoneFrame>
  );
}