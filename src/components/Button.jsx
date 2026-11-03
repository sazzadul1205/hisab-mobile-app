export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "flex items-center justify-center gap-2 w-full p-[15px] rounded-[14px] " +
    "font-bold text-[14.5px] tracking-[-0.1px] border-0 cursor-pointer font-[inherit]";

  const variants = {
    primary:
      "bg-[var(--brand)] text-white shadow-[0_10px_20px_-12px_rgba(14,124,90,0.9)]",
    secondary: "bg-white text-[var(--ink)] border border-[var(--line)]",
    danger:
      "bg-[var(--danger)] text-white shadow-[0_10px_20px_-12px_rgba(192,57,43,0.9)]",
    ghost:
      "bg-transparent text-[var(--brand)] border border-dashed border-[var(--brand)]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonRow({ children }) {
  return <div className="flex gap-2.5">{children}</div>;
}
