// PhoneFrame is preview chrome. On real mobile devices all the decorative
// bits (border, rounded corners, shadow, fake status bar) disappear and the
// app fills the viewport edge-to-edge using 100dvh + safe-area insets.

export function PhoneFrame({ children }) {
  return (
    <div className="min-h-dvh bg-(--bg) md:flex md:justify-center md:items-start md:p-6">
      <div
        className="
          w-full h-dvh bg-(--app) flex flex-col overflow-hidden
          pt-[env(safe-area-inset-top)]
          md:w-102.5 md:h-216 md:pt-0 md:border-10 md:border-[#101B17]
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
      className="hidden md:flex items-center justify-between px-6.5 pt-3.5 pb-1.5
                 text-[12.5px] font-semibold flex-none"
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.25">
        <i className="block w-3.75 h-2.25 bg-(--ink) rounded-sm" />
        <i className="block w-2.75 h-2.75 bg-(--ink) rounded-full" />
        <i className="block w-5 h-2.5 bg-(--ink) rounded-sm" />
      </div>
    </div>
  );
}

export function ScrollArea({ children, overscroll = "contain" }) {
  return (
    <div
      className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4.5 pb-5
                 overscroll-y-${overscroll} scrollbar-none [&::-webkit-scrollbar]:hidden`}
    >
      {children}
    </div>
  );
}
