import { Link } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    to: "/dashboard",
    icon: (
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    ),
  },
  {
    id: "activity",
    label: "Activity",
    to: "/transactions",
    icon: (
      <>
        <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
  },
  {
    id: "accounts",
    label: "Accounts",
    to: "/accounts",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M3 10h18" />
        <circle cx="17" cy="14" r="1" />
      </>
    ),
  },
  {
    // Route doesn't exist yet — kept inert until /reports is built
    id: "reports",
    label: "Reports",
    icon: <path d="M5 19V11M11 19V5M17 19v-9" />,
  },
  {
    // Route doesn't exist yet — kept inert until /settings is built
    id: "settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </>
    ),
  },
];

export function BottomNav({ active = "home" }) {
  return (
    <nav
      className="flex-none grid grid-cols-5 px-1.5 pt-2.5
                 pb-[calc(16px+env(safe-area-inset-bottom))]
                 bg-[rgba(255,255,255,0.94)] backdrop-blur-[14px]
                 border-t border-(--line)"
    >
      {NAV_ITEMS.map((it) => {
        const isOn = it.id === active;
        const cls =
          "flex flex-col items-center gap-1 py-1 no-underline " +
          "text-[10px] font-semibold " +
          (isOn ? "text-[var(--brand)]" : "text-[var(--muted)]");

        const content = (
          <>
            <svg
              viewBox="0 0 24 24"
              className={
                "w-5.25 h-5.25 stroke-current fill-none " +
                "[stroke-linecap:round] [stroke-linejoin:round] " +
                (isOn ? "stroke-[2.1]" : "stroke-[1.7]")
              }
            >
              {it.icon}
            </svg>
            {it.label}
          </>
        );

        return it.to ? (
          <Link key={it.id} to={it.to} className={cls}>
            {content}
          </Link>
        ) : (
          <a key={it.id} href="#" className={cls}>
            {content}
          </a>
        );
      })}
    </nav>
  );
}
