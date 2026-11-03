export function SearchBar({
  placeholder = "Search",
  defaultValue,
  value,
  onChange,
}) {
  return (
    <div
      className="flex items-center gap-2.25 bg-white border border-(--line)
                    rounded-[14px] px-3.25 py-2.75 mb-3"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 stroke-(--muted) fill-none stroke-2 flex-none
                   [stroke-linecap:round] [stroke-linejoin:round]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className="flex-1 min-w-0 bg-transparent border-0 outline-none
                   text-[13.5px] font-[inherit] text-(--ink)
                   placeholder:text-(--muted)"
      />
    </div>
  );
}
