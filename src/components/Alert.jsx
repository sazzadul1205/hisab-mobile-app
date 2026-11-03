const TONES = {
  info:   { bg: 'var(--tr-soft)',     fg: 'var(--tr)' },
  warn:   { bg: 'var(--warn-soft)',   fg: 'var(--warn)' },
  danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  ok:     { bg: 'var(--in-soft)',     fg: 'var(--in)' },
}

export function Alert({ tone = 'info', icon, title, children }) {
  const t = TONES[tone] ?? TONES.info
  return (
    <div className="flex items-start gap-[11px] p-[13px] pr-[14px]
                    rounded-[14px] border border-[var(--line)] bg-white">
      <span
        className="w-8 h-8 rounded-[10px] flex-none grid place-items-center"
        style={{ background: t.bg, color: t.fg }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 stroke-current fill-none stroke-[1.9]
                     [stroke-linecap:round] [stroke-linejoin:round]"
        >
          {icon}
        </svg>
      </span>
      <div>
        <b className="block text-[13px] font-semibold mb-0.5">{title}</b>
        <small className="text-[11.5px] text-[var(--muted)] leading-[1.5]">
          {children}
        </small>
      </div>
    </div>
  )
}