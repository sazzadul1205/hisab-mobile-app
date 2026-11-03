export function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex justify-center items-start p-6">
      <div
        className="w-[410px] h-[864px] bg-[var(--app)] border-[10px] border-[#101B17]
                   rounded-[48px] relative overflow-hidden flex flex-col
                   shadow-[0_32px_64px_-28px_rgba(14,26,22,0.42)]"
      >
        {children}
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-[26px] pt-[14px] pb-[6px]
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
