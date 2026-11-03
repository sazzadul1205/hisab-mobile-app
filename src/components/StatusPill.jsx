const TONES = {
  in:      'bg-[var(--in-soft)] text-[var(--in)]',
  out:     'bg-[var(--out-soft)] text-[var(--out)]',
  tr:      'bg-[var(--tr-soft)] text-[var(--tr)]',
  warn:    'bg-[var(--warn-soft)] text-[var(--warn)]',
  danger:  'bg-[var(--danger-soft)] text-[var(--danger)]',
  ok:      'bg-[var(--brand-soft)] text-[var(--brand-dk)]',
  neutral: 'bg-[var(--app)] text-[var(--muted)] border border-[var(--line)]',
}

export function StatusPill({ tone = 'neutral', children }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.25 text-[11px] font-bold ' +
        'tracking-[0.02em] px-2.25 py-1 rounded-full whitespace-nowrap ' +
        TONES[tone]
      }
    >
      {children}
    </span>
  )
}