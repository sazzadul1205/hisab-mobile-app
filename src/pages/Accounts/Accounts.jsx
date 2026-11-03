import { useNavigate } from "react-router-dom";
import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";
import { IconButton } from "../../components/IconButton";
import { BottomNav } from "../../components/BottomNav";
import { SectionLabel } from "../../components/SectionLabel";
import { Note } from "../../components/Note";

function AccountCard({
  initial,
  color,
  name,
  subtitle,
  balance,
  faded = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={
        "flex items-center gap-3.25 bg-white border border-(--line) " +
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
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <b className="block text-[13.5px] font-semibold truncate">{name}</b>
        <small className="block text-[11.5px] text-(--muted) mt-0.5 truncate">
          {subtitle}
        </small>
      </div>
      <div className="text-right text-[14px] font-bold num tracking-[-0.2px] whitespace-nowrap">
        {balance}
      </div>
    </div>
  );
}

export default function Accounts() {
  const navigate = useNavigate();
  const goToDetail = () => navigate("/accounts/citybank");

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
              3 active · 1 archived
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
            ৳1,24,500.00
          </div>
          <div className="text-[11.5px] text-white/65 mt-1">
            Updated just now
          </div>
        </div>

        <SectionLabel className="mt-5">Cash &amp; mobile wallets</SectionLabel>
        <AccountCard
          initial="C"
          color="#0E7C5A"
          name="Cash"
          subtitle="Cash · opened ৳5,000.00"
          balance="৳8,250.00"
          onClick={goToDetail}
        />
        <AccountCard
          initial="b"
          color="#D6336C"
          name="bKash"
          subtitle="Mobile wallet · opened ৳1,200.00"
          balance="৳24,650.00"
          onClick={goToDetail}
        />

        <SectionLabel>Bank</SectionLabel>
        <AccountCard
          initial="CB"
          color="#3355C4"
          name="City Bank — Savings"
          subtitle="Bank · opened ৳40,000.00"
          balance="৳91,600.00"
          onClick={goToDetail}
        />

        <SectionLabel>Archived</SectionLabel>
        <AccountCard
          initial="N"
          color="#7C8B85"
          name="Nagad"
          subtitle="Mobile wallet · archived"
          balance="৳0.00"
          faded
          onClick={goToDetail}
        />

        <Note>
          Balances are always recalculated from the opening balance and saved
          transactions — never stored as a fixed number.
        </Note>
      </ScrollArea>
      <BottomNav active="accounts" />
    </PhoneFrame>
  );
}
