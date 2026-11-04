export function AmountInput({ value, onChange, hint }) {
  const displayValue = value ?? "";
  const width = Math.max(3, displayValue.length + 1);

  return (
    <div className="text-center pt-2 pb-5">
      <div className="flex items-center justify-center">
        <span className="text-[15px] font-bold text-(--muted) mr-1.5">৳</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          autoComplete="off"
          style={{ width: `${width}ch` }}
          className="text-[42px] font-bold tracking-[-1.6px] num text-(--ink)
                     bg-transparent border-0 outline-none text-center
                     font-[inherit] placeholder:text-[#C9D4CF]"
        />
      </div>
      {hint && <div className="text-[12px] text-(--muted) mt-2">{hint}</div>}
    </div>
  );
}
