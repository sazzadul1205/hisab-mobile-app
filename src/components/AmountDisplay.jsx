export function AmountDisplay({ value, hint }) {
  // value like "45,000.00" — split into major.decimal for the faded cents
  const [major, decimal] = value.split(".");

  return (
    <div className="text-center pt-2 pb-5">
      <span className="text-[15px] font-bold text-(--muted) mr-1.5">
        ৳
      </span>
      <span className="text-[42px] font-bold tracking-[-1.6px] num text-(--ink)">
        {major}
        {decimal && <span className="opacity-40">.{decimal}</span>}
      </span>
      <span
        className="inline-block w-0.5 h-8.5 bg-(--brand)
                   align-[-6px] ml-0.5 rounded-sm"
      />
      {hint && (
        <div className="text-[12px] text-(--muted) mt-2">{hint}</div>
      )}
    </div>
  );
}
