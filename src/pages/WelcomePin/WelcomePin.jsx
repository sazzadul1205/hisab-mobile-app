import { PhoneFrame, StatusBar, ScrollArea } from "../../components/PhoneFrame";

function PinDot({ filled }) {
  return (
    <i
      className={
        "block w-3.5 h-3.5 rounded-full border-[1.5px] " +
        (filled
          ? "bg-[var(--brand)] border-[var(--brand)]"
          : "bg-transparent border-[#C9D4CF]")
      }
    />
  );
}

function Bullet({ icon, title, subtitle }) {
  return (
    <div className="flex gap-[11px] items-start">
      <div
        className="w-[30px] h-[30px] rounded-[9px] flex-none grid place-items-center
                   bg-white border border-[var(--line)] text-[var(--brand)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[15px] h-[15px] stroke-current fill-none stroke-[1.9]
                     [stroke-linecap:round] [stroke-linejoin:round]"
        >
          {icon}
        </svg>
      </div>
      <div>
        <b className="block text-[13px] font-semibold mb-[2px]">{title}</b>
        <small className="text-[12px] text-[var(--muted)] leading-[1.5]">
          {subtitle}
        </small>
      </div>
    </div>
  );
}

export default function WelcomePin() {
  return (
    <PhoneFrame>
      <StatusBar />
      <ScrollArea>
        {/* Hero */}
        <div className="text-center pt-[26px] pb-[22px]">
          <div
            className="w-16 h-16 rounded-[22px] mx-auto mb-[18px] grid place-items-center
                       bg-[var(--brand-soft)] text-[var(--brand-dk)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 stroke-current fill-none stroke-[1.8]
                         [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <rect x="4" y="10.5" width="16" height="10.5" rx="3" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h2 className="m-0 mb-2 text-[22px] font-bold tracking-[-0.5px]">
            Set up your PIN
          </h2>
          <p className="m-0 mx-auto text-[13px] leading-[1.6] text-[var(--muted)] max-w-[30ch]">
            Your records stay on this device. A PIN protects access to them.
          </p>
        </div>

        {/* PIN dots — static mock: 4 filled, awaiting re-enter to confirm */}
        <div className="flex gap-[15px] justify-center mt-[26px]">
          <PinDot filled />
          <PinDot filled />
          <PinDot filled />
          <PinDot filled />
        </div>
        <div className="text-center text-[12px] text-[var(--muted)] mt-[14px]">
          Re-enter to confirm
        </div>

        {/* Value bullets */}
        <div className="flex flex-col gap-3 mt-[22px] mb-1.5">
          <Bullet
            icon={
              <>
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M3 9h18" />
              </>
            }
            title="Stored locally"
            subtitle="No account, no server, no upload."
          />
          <Bullet
            icon={<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />}
            title="Protected access"
            subtitle="PIN is never stored in plaintext."
          />
          <Bullet
            icon={
              <>
                <path d="M12 8v5" />
                <circle cx="12" cy="16.5" r="1" />
                <circle cx="12" cy="12" r="9" />
              </>
            }
            title="Keep a backup"
            subtitle="Clearing browser data can erase records."
          />
        </div>
      </ScrollArea>

      {/* Footer — respects iOS home indicator on real devices */}
      <div
        className="flex-none px-[18px] pt-3
                   pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(247,249,248,0) 0%, var(--app) 34%)",
        }}
      >
        <button
          className="flex items-center justify-center w-full p-[15px] rounded-[14px]
                     font-bold text-[14.5px] tracking-[-0.1px] border-0 cursor-pointer
                     bg-[var(--brand)] text-white
                     shadow-[0_10px_20px_-12px_rgba(14,124,90,0.9)]"
        >
          Continue
        </button>
        <div className="text-center mt-3">
          <span className="text-[11.5px] text-[var(--muted)]">
            PIN does not encrypt data on its own
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}
