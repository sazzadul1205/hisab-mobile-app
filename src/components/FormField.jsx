/* ----------------------------------------------------------------
   Field — label + content wrapper
   ---------------------------------------------------------------- */
export function Field({ label, hint, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11.5px] font-bold tracking-wider uppercase text-(--muted) mb-1.75">
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
   TextInput — uncontrolled via `defaultValue` or `inputRef`,
   controlled via `value` + `onChange`
   ---------------------------------------------------------------- */
export function TextInput({
  defaultValue,
  placeholder,
  inputMode,
  type = "text",
  className = "",
  inputRef,
  value,
  onChange,
}) {
  const controlled = value !== undefined;
  return (
    <input
      ref={inputRef}
      type={type}
      inputMode={inputMode}
      {...(controlled ? { value, onChange } : { defaultValue })}
      placeholder={placeholder}
      className={
        "w-full bg-(--card) border border-(--line) rounded-[14px] " +
        "px-3.5 py-3.25 text-[14px] text-(--ink) " +
        "placeholder:text-(--muted) outline-none font-[inherit] " +
        "focus:border-(--brand) " +
        className
      }
    />
  );
}

/* ----------------------------------------------------------------
   SelectInput — two modes:
     - options array  → native <select> (interactive)
     - no options     → static display button (existing behavior)
   ---------------------------------------------------------------- */
export function SelectInput({
  value,
  onChange,
  defaultValue,
  inputRef,
  options,
  placeholder,
}) {
  if (Array.isArray(options)) {
    return (
      <div className="relative">
        <select
          ref={inputRef}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className="w-full appearance-none bg-(--card) border border-(--line) rounded-[14px]
                     px-3.5 py-3.25 text-[14px] cursor-pointer font-[inherit]
                     text-left text-(--ink) outline-none focus:border-(--brand)
                     pr-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) text-[16px] leading-none">
          ›
        </span>
      </div>
    );
  }

  const hasValue = value != null && value !== "";
  return (
    <button
      type="button"
      className="w-full flex items-center justify-between bg-(--card) border border-(--line) rounded-[14px] px-3.5 py-3.25 text-[14px] cursor-pointer font-[inherit] text-left"
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
   ---------------------------------------------------------------- */
export function MoneyInput({
  defaultValue,
  size = "md",
  inputRef,
  value,
  onChange,
}) {
  const controlled = value !== undefined;
  const isSmall = size === "sm";
  return (
    <div
      className={
        "flex items-center gap-2.5 bg-(--card) border border-(--line) " +
        "rounded-[14px] focus-within:border-(--brand) " +
        (isSmall ? "px-3.5 py-3" : "px-3.5 py-3.75")
      }
    >
      <span className="text-[14px] font-medium text-(--muted) mr-1">৳</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        {...(controlled ? { value, onChange } : { defaultValue })}
        className={
          "flex-1 min-w-0 bg-transparent border-0 outline-none num " +
          "text-(--ink) font-[inherit] " +
          (isSmall ? "text-[14px] font-semibold" : "text-[22px] font-bold")
        }
      />
    </div>
  );
}
