// Shared drawr primitives. Styling lives in index.css; these components only
// wire semantics (roles, aria state, keyboard) so every control behaves alike.
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** The drawr mark: a drawer seen from above — four cells, one filled. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="var(--ink)" />
      <rect x="5" y="5" width="6.4" height="6.4" rx="1.8" fill="var(--accent)" />
      <rect x="12.6" y="5" width="6.4" height="6.4" rx="1.8" fill="var(--bg)" opacity="0.92" />
      <rect x="5" y="12.6" width="14" height="6.4" rx="1.8" fill="var(--bg)" opacity="0.92" />
    </svg>
  );
}

export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <Mark size={Math.round(size * 1.3)} />
      drawr
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode; testid?: string; title?: string }[];
  onChange: (v: T) => void;
  size?: "sm";
  label: string;
}) {
  return (
    <div className={`seg${size ? " " + size : ""}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          data-testid={o.testid}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  testid,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  testid?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={checked}
      aria-label={label}
      data-testid={testid}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    />
  );
}

/** A modal sheet: focus moves in, Escape closes, scrim click closes. */
export function Sheet({
  title,
  subtitle,
  onClose,
  width = 560,
  children,
  footer,
  testid,
  headerExtra,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
  testid?: string;
  headerExtra?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()} data-testid={testid}>
      <div
        ref={ref}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <div className="sheet-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="sheet-title">{title}</h2>
            {subtitle && <p className="sheet-sub">{subtitle}</p>}
          </div>
          <button type="button" className="btn btn-icon" aria-label="Close" onClick={onClose}
            style={{ background: "var(--fill)", borderRadius: "50%", width: 30, height: 30 }}>
            <X size={15} strokeWidth={2.4} />
          </button>
        </div>
        {headerExtra}
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

/** A tiny top-down glyph of a footprint, used in lists and the inspector. */
export function FootprintGlyph({
  w,
  d,
  color = "var(--ink-3)",
  cell = 6,
  gap = 1.5,
}: {
  w: number;
  d: number;
  color?: string;
  cell?: number;
  gap?: number;
}) {
  const cw = Math.min(w, 6);
  const cd = Math.min(d, 6);
  const W = cw * cell + (cw - 1) * gap;
  const H = cd * cell + (cd - 1) * gap;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden style={{ flexShrink: 0 }}>
      <rect x="0" y="0" width={W} height={H} rx={Math.min(3, cell / 2)} fill={color} />
    </svg>
  );
}
