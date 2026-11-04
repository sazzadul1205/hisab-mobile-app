import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { Note } from "../../components/Note";
import { Button } from "../../components/Button";
import { useAccounts } from "../../hooks/useAccounts";
import { formatBDT } from "../../lib/money";

/* Colour per account type — used for the badge initials */
const TYPE_COLOR = {
  cash: "#0E7C5A",
  wallet: "#D6336C",
  bank: "#3355C4",
  other: "#7C8B85",
};

function initials(name) {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "?";
  // Single-word short names → first letter upper-case
  if (cleaned.length <= 2) return cleaned.toUpperCase();
  return cleaned[0].toUpperCase();
}

function AccountCard({ account, balance, faded, onClick }) {
  const color = TYPE_COLOR[account.type] ?? "#7C8B85";
  return (
    <div
      onClick={onClick}
      className={
        "flex items-center gap-3 bg-(--card) border border-(--line) " +
        "rounded-[18px] px-3.75 py-3.5 mb-2.5 cursor-pointer " +
        "shadow-[0_1px_2px_rgba(14,26,22,0.06)] " +
        (faded ? "opacity-60" : "")
      }
    >
      <div
        className="w-10.5 h-10.5 rounded-[13px] flex-none grid place-items-center
                   text-[15px] font-extrabold text-white"
        style={{ background: color }}
      >
        {initials(account.name)}
      </div>
      <div className="flex-1 min-w-0">
        <b className="block text-[13.5px] font-semibold truncate">
          {account.name}
        </b>
        <small className="block text-[11.5px] text-(--muted) mt-0.5 truncate">
          {account.isArchived
            ? "Archived"
            : `Opened ${formatBDT(account.openingBalance)}`}
        </small>
      </div>
      <div className="text-right text-[14px] font-bold num tracking-[-0.2px] whitespace-nowrap">
        {formatBDT(balance)}
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-13 h-13 rounded-2xl mx-auto mb-3 grid place-items-center bg-(--app) border border-dashed border-(--line) text-(--muted)">
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 stroke-current fill-none stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
        >
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <path d="M3 10h18" />
        </svg>
      </div>
      <b className="block text-[13.5px] font-semibold mb-1.25">
        No accounts yet
      </b>
      <small className="block text-[12px] text-(--muted) leading-[1.55] max-w-[34ch] mx-auto mb-4">
        Add your first account — cash, wallet, or bank — to start tracking.
      </small>
      <Button onClick={onCreate}>+ Add account</Button>
    </div>
  );
}

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, balances, combined, loading } = useAccounts();

  if (loading) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <div className="p-4">
            <div className="skeleton-box h-8 w-32 rounded mb-2" />
            <div className="skeleton-box h-4 w-40 rounded mb-6" />
            <div className="h-24 bg-(--line-2) rounded-[18px] mb-4 animate-pulse" />
            <div className="h-16 bg-(--line-2) rounded-[18px] mb-2.5 animate-pulse" />
            <div className="h-16 bg-(--line-2) rounded-[18px] animate-pulse" />
          </div>
        </ScrollArea>
        <BottomNav active="accounts" />
      </PhoneFrame>
    );
  }

  if (accounts.length === 0) {
    return (
      <PhoneFrame>
        <StatusBar />
        <ScrollArea>
          <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
            <div>
              <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
                Accounts
              </h2>
              <div className="text-[12.5px] text-(--muted) mt-0.75">
                Get started
              </div>
            </div>
            <IconButton
              label="Add account"
              icon={<path d="M12 5v14M5 12h14" />}
              onClick={() => navigate("/accounts/new")}
            />
          </div>
          <EmptyState onCreate={() => navigate("/accounts/new")} />
        </ScrollArea>
        <BottomNav active="accounts" />
      </PhoneFrame>
    );
  }

  const active = accounts.filter((a) => !a.isArchived);
  const archived = accounts.filter((a) => a.isArchived);
  const cashAndWallets = active.filter(
    (a) => a.type === "cash" || a.type === "wallet",
  );
  const banks = active.filter((a) => a.type === "bank");
  const others = active.filter(
    (a) => a.type !== "cash" && a.type !== "wallet" && a.type !== "bank",
  );

  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        <div className="flex items-center justify-between gap-3 py-1.5 pb-3.5">
          <div>
            <h2 className="m-0 text-[23px] font-bold tracking-[-0.5px] leading-tight">
              Accounts
            </h2>
            <div className="text-[12.5px] text-(--muted) mt-0.75">
              {active.length} active
              {archived.length > 0 ? ` · ${archived.length} archived` : ""}
            </div>
          </div>
          <IconButton
            label="Add account"
            icon={<path d="M12 5v14M5 12h14" />}
            onClick={() => navigate("/accounts/new")}
          />
        </div>

        <div
          className="rounded-[18px] p-5 text-white"
          style={{ background: "linear-gradient(150deg, #118A64, #0A5A41)" }}
        >
          <div className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-white/70">
            Total across active accounts
          </div>
          <div className="num text-[29px] font-bold tracking-[-1px] mt-1.5">
            {formatBDT(combined)}
          </div>
          <div className="text-[11.5px] text-white/65 mt-1">
            Updated just now
          </div>
        </div>

        {cashAndWallets.length > 0 && (
          <>
            <SectionLabel className="mt-5">Cash & mobile wallets</SectionLabel>
            {cashAndWallets.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                balance={balances.get(a.id) ?? 0}
                onClick={() => navigate(`/accounts/${a.id}`)}
              />
            ))}
          </>
        )}

        {banks.length > 0 && (
          <>
            <SectionLabel>Bank</SectionLabel>
            {banks.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                balance={balances.get(a.id) ?? 0}
                onClick={() => navigate(`/accounts/${a.id}`)}
              />
            ))}
          </>
        )}

        {others.length > 0 && (
          <>
            <SectionLabel>Other</SectionLabel>
            {others.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                balance={balances.get(a.id) ?? 0}
                onClick={() => navigate(`/accounts/${a.id}`)}
              />
            ))}
          </>
        )}

        {archived.length > 0 && (
          <>
            <SectionLabel>Archived</SectionLabel>
            {archived.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                balance={balances.get(a.id) ?? 0}
                faded
                onClick={() => navigate(`/accounts/${a.id}`)}
              />
            ))}
          </>
        )}

        <Note>
          Balances are always recalculated from the opening balance and saved
          transactions — never stored as a fixed number.
        </Note>
      </ScrollArea>
      <BottomNav active="accounts" />
    </PhoneFrame>
  );
}
