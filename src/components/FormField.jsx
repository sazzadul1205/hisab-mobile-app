/* ----------------------------------------------------------------
   Field — label + content wrapper
   ---------------------------------------------------------------- */
export function Field({ label, hint, children }) {
  return (
    <div className="mb-3.5">
      <label
        className="block text-[11.5px] font-bold tracking-wider
                        uppercase text-(--muted) mb-1.75"
      >
        {label}
        {hint && (
          <span className="normal-case tracking-normal font-medium ml-1">
            ({hint})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------
   TextInput — type defaults to "text"; pass "password" for backups/PIN
   ---------------------------------------------------------------- */
export function TextInput({
  defaultValue,
  placeholder,
  inputMode,
  type = "text",
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full bg-white border border-(--line) rounded-[14px]
                 px-3.5 py-3.25 text-[14px] text-(--ink)
                 placeholder:text-(--muted) outline-none font-[inherit]
                 focus:border-(--brand)"
    />
  );
}

/* ----------------------------------------------------------------
   SelectInput — looks like an input, opens a sheet later
   ---------------------------------------------------------------- */
export function SelectInput({ value, placeholder }) {
  const hasValue = value != null && value !== "";
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between bg-white
                 border border-(--line) rounded-[14px]
                 px-3.5 py-3.25 text-[14px] cursor-pointer font-[inherit]
                 text-left"
    >
      <span className={hasValue ? "text-(--ink)" : "text-(--muted)"}>
        {hasValue ? value : placeholder}
      </span>
      <span className="text-(--muted) text-[16px] leading-none">›</span>
    </button>
  );
}

/* ----------------------------------------------------------------
   MoneyInput — ৳ prefix + tabular amount
   size: "md" (default, big bold) | "sm" (secondary, e.g. fee)
   ---------------------------------------------------------------- */
export function MoneyInput({ defaultValue, size = "md" }) {
  const isSmall = size === "sm";
  return (
    <div
      className={
        "flex items-center gap-2.5 bg-white border border-(--line) " +
        "rounded-[14px] " +
        (isSmall ? "px-3.5 py-3" : "px-3.5 py-3.75")
      }
    >
      <span className="text-[14px] font-medium text-(--muted) mr-1">৳</span>
      <input
        type="text"
        inputMode="decimal"
        defaultValue={defaultValue}
        className={
          "flex-1 min-w-0 bg-transparent border-0 outline-none num " +
          "text-(--ink) font-[inherit] " +
          (isSmall ? "text-[14px] font-semibold" : "text-[22px] font-bold")
        }
      />
    </div>
  );
}
