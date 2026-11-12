export function Switch({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                       ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                       ${checked ? "bg-[var(--brand)]" : "bg-(--line)"}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform
                           ${checked ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
}