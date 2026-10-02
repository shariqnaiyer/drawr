import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock, Search, X } from "lucide-react";
import { DRAWERS, DRAWER_CATEGORIES, drawerLabel, searchDrawers, type DrawerCategory, type DrawerPreset } from "../drawers";
import { formatLength, type LengthUnit } from "../lib/units";
import type { RecentSize } from "../lib/recent";

export type Picked = { kind: "preset"; preset: DrawerPreset } | { kind: "recent"; size: RecentSize };

const CAT_ORDER = DRAWER_CATEGORIES.map((c) => c.id);

type Option =
  | { key: string; kind: "preset"; preset: DrawerPreset }
  | { key: string; kind: "recent"; size: RecentSize };

const dims = (w: number, d: number, h: number | null, unit: LengthUnit) =>
  `${formatLength(w, unit)} × ${formatLength(d, unit)}${h ? ` × ${formatLength(h, unit)}` : ""} ${unit}`;

/** Searchable combobox of common drawers (plus this browser's recent sizes). */
export function DrawerPicker({
  selected,
  recent,
  unit,
  onPick,
  onClear,
}: {
  selected: DrawerPreset | null;
  recent: RecentSize[];
  unit: LengthUnit;
  onPick: (p: Picked) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<DrawerCategory | "all">("all");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const presentCats = useMemo(() => DRAWER_CATEGORIES.filter((c) => DRAWERS.some((d) => d.category === c.id)), []);

  const options: Option[] = useMemo(() => {
    // browsing: group by category in a fixed order; searching: keep relevance order
    const found = searchDrawers(q, { category: cat });
    const ordered = q ? found : [...found].sort((x, y) => CAT_ORDER.indexOf(x.category) - CAT_ORDER.indexOf(y.category));
    const presets = ordered.map((p) => ({ key: p.id, kind: "preset" as const, preset: p }));
    const recents = !q && cat === "all"
      ? recent.map((r, i) => ({ key: `recent-${i}`, kind: "recent" as const, size: r }))
      : [];
    return [...recents, ...presets];
  }, [q, cat, recent]);

  useEffect(() => setActive(0), [q, cat]);

  // close on outside pointer
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // keep the active option in view
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (o: Option) => {
    onPick(o.kind === "preset" ? { kind: "preset", preset: o.preset } : { kind: "recent", size: o.size });
    setOpen(false);
    setQ("");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Home") {
      setActive(0);
    } else if (e.key === "End") {
      setActive(options.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
  };

  // group headers: Recent, then each category (only when not searching)
  let lastGroup = "";
  const groupOf = (o: Option) =>
    o.kind === "recent" ? "Recent" : q ? "Matches" : DRAWER_CATEGORIES.find((c) => c.id === o.preset.category)?.label ?? "";

  if (DRAWERS.length === 0 && recent.length === 0) return null;

  return (
    <div className="dp" ref={rootRef}>
      <div className="dp-trigger-row">
        <button
          type="button"
          className="dp-trigger"
          data-testid="drawer-picker"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Search size={15} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
          <span className={`dp-trigger-text${selected ? "" : " placeholder"}`}>
            {selected ? drawerLabel(selected) : "Choose a common drawer or case…"}
          </span>
          <ChevronDown size={15} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
        </button>
        {selected && (
          <button type="button" className="btn btn-icon" aria-label="Clear drawer preset" title="Clear preset" onClick={onClear}>
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div className="dp-pop" role="dialog" aria-label="Common drawers">
          <div className="field" style={{ margin: "10px 10px 0", height: 36 }}>
            <Search size={15} style={{ color: "var(--ink-4)" }} />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded
              aria-controls={`${id}-list`}
              aria-autocomplete="list"
              aria-activedescendant={options[active] ? `${id}-${active}` : undefined}
              aria-label="Search drawers"
              data-testid="drawer-search"
              placeholder="Search IKEA Alex, Husky, L-BOXX…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
            />
          </div>
          {presentCats.length > 1 && (
            <div className="dp-cats" role="group" aria-label="Category">
              <button type="button" className="lib-cat" aria-pressed={cat === "all"} onClick={() => setCat("all")}>All</button>
              {presentCats.map((c) => (
                <button key={c.id} type="button" className="lib-cat" aria-pressed={cat === c.id}
                  data-testid={`drawer-cat-${c.id}`} onClick={() => setCat(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <ul className="dp-list" role="listbox" id={`${id}-list`} ref={listRef} aria-label="Drawers">
            {options.length === 0 && (
              <li className="dp-empty">No drawers match “{q}”. Measure inside your drawer and type the size below.</li>
            )}
            {options.map((o, i) => {
              const g = groupOf(o);
              const header = g !== lastGroup ? ((lastGroup = g), g) : null;
              return (
                <li key={o.key} role="presentation">
                  {header && <div className="dp-group" role="presentation">{header}</div>}
                  <div
                    role="option"
                    id={`${id}-${i}`}
                    data-index={i}
                    data-testid={o.kind === "preset" ? `drawer-${o.preset.id}` : `drawer-recent-${i}`}
                    aria-selected={i === active}
                    className="dp-opt"
                    onPointerMove={() => setActive(i)}
                    onClick={() => choose(o)}
                  >
                    {o.kind === "preset" ? (
                      <>
                        <span className="dp-opt-main">
                          <b>{o.preset.brand} {o.preset.model}</b>
                          {o.preset.variant && <span className="dp-opt-variant">{o.preset.variant}</span>}
                        </span>
                        <span className="dp-opt-dims num">
                          {dims(o.preset.inner.width_mm, o.preset.inner.depth_mm, o.preset.inner.height_mm, unit)}
                        </span>
                        {o.preset.source_kind === "community-measured" && <span className="badge" title="Measured by the community">Measured</span>}
                      </>
                    ) : (
                      <>
                        <Clock size={14} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
                        <span className="dp-opt-main"><b>{o.size.label ?? "Custom size"}</b></span>
                        <span className="dp-opt-dims num">{dims(o.size.widthMm, o.size.depthMm, o.size.heightMm, unit)}</span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="dp-foot">
            Inside dimensions, width × depth × height. Always check yours with a tape measure.
          </div>
        </div>
      )}
    </div>
  );
}
