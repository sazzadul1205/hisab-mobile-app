function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

export function DateTimeInput({ value, onChange }) {
  return (
    <input
      type="datetime-local"
      value={toLocalInput(value)}
      onChange={(e) => onChange(fromLocalInput(e.target.value))}
      className="w-full bg-white border border-(--line) rounded-[14px]
                 px-3.5 py-3.25 text-[14px] text-(--ink)
                 outline-none font-[inherit] focus:border-(--brand)"
    />
  );
}
