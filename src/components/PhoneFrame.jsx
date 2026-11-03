// PhoneFrame is preview chrome. On real mobile devices all the decorative
// bits (border, rounded corners, shadow, fake status bar) disappear and the
// app fills the viewport edge-to-edge using 100dvh + safe-area insets.

export function PhoneFrame({ children }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] md:flex md:justify-center md:items-start md:p-6">
      <div
        className="
          w-full h-dvh bg-[var(--app)] flex flex-col overflow-hidden
          pt-[env(safe-area-inset-top)]
          md:w-[410px] md:h-[864px] md:pt-0 md:border-[10px] md:border-[#101B17]
          md:rounded-[48px] md:relative
          md:shadow-[0_32px_64px_-28px_rgba(14,26,22,0.42)]
        "
      >
        {children}
      </div>
    </div>
  );
}

// Preview-only fake iOS status bar. Hidden on real devices so the OS's
// own status bar is what the user actually sees.
export function StatusBar() {
  return (
    <div
      className="hidden md:flex items-center justify-between px-[26px] pt-[14px] pb-[6px]
                 text-[12.5px] font-semibold flex-none"
    >
      <span>9:41</span>
      <div className="flex items-center gap-[5px]">
        <i className="block w-[15px] h-[9px] bg-[var(--ink)] rounded-sm" />
        <i className="block w-[11px] h-[11px] bg-[var(--ink)] rounded-full" />
        <i className="block w-[20px] h-[10px] bg-[var(--ink)] rounded-sm" />
      </div>
    </div>
  );
}

export function ScrollArea({ children }) {
  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-[18px] pb-5
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}
