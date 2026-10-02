import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, ExternalLink, Loader2, RotateCw, WifiOff } from "lucide-react";
import { useStore, inBounds } from "../store";
import { computeGrid, type GridComputeResult } from "../api";
import { GRID_UNIT, HEIGHT_UNIT } from "../types";
import { drawerById, drawerLabel, type DrawerPreset } from "../drawers";
import { formatLength, parseLength, type LengthUnit } from "../lib/units";
import { maxBinU } from "../lib/fit";
import { loadRecent, rememberSize } from "../lib/recent";
import { Segmented, Wordmark } from "./ui";
import { DrawerPicker, type Picked } from "./DrawerPicker";
import "./setup.css";

type Mode = "dimensions" | "units";

const positiveInt = (s: string) => {
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
};
const close = (a: number | null, b: number | null) =>
  a === b || (a !== null && b !== null && Math.abs(a - b) < 0.05);

const SOURCE_LABEL: Record<DrawerPreset["source_kind"], string> = {
  manufacturer: "Manufacturer spec",
  retailer: "Retailer spec",
  "community-measured": "Measured by the community",
};

export function Setup() {
  const { setGrid, setStep, setDrawer, grid, drawer, bins } = useStore();
  const [mode, setMode] = useState<Mode>(drawer || !bins.length ? "dimensions" : "units");
  const [unit, setUnit] = useState<LengthUnit>("mm");
  // field text is kept in the current unit; parsed to mm on every render
  const [widthTxt, setWidthTxt] = useState(drawer ? formatLength(drawer.widthMm, "mm") : "300");
  const [depthTxt, setDepthTxt] = useState(drawer ? formatLength(drawer.depthMm, "mm") : "220");
  const [heightTxt, setHeightTxt] = useState(drawer?.heightMm ? formatLength(drawer.heightMm, "mm") : "");
  const [cols, setCols] = useState(String(grid.cols));
  const [rows, setRows] = useState(String(grid.rows));
  const [presetId, setPresetId] = useState<string | null>(drawer?.presetId ?? null);
  const [result, setResult] = useState<GridComputeResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [retry, setRetry] = useState(0);
  const recent = useMemo(loadRecent, []);

  const widthMm = parseLength(widthTxt, unit);
  const depthMm = parseLength(depthTxt, unit);
  const heightMm = heightTxt.trim() ? parseLength(heightTxt, unit) : null;
  const heightInvalid = heightTxt.trim() !== "" && heightMm === null;
  const c = positiveInt(cols);
  const r = positiveInt(rows);

  const a = mode === "dimensions" ? widthMm : c;
  const b = mode === "dimensions" ? depthMm : r;
  const inputsValid = a !== null && b !== null;

  // a picked preset stays attached only while the fields still match it
  const preset = drawerById(presetId);
  useEffect(() => {
    if (!preset) return;
    const p = preset.inner;
    if (!close(widthMm, p.width_mm) || !close(depthMm, p.depth_mm) || !close(heightMm, p.height_mm)) setPresetId(null);
  }, [preset, widthMm, depthMm, heightMm]);

  // The backend owns the grid math, so the UI and the CAD kernel can never
  // disagree about how many units fit. Debounced so typing doesn't spam it.
  useEffect(() => {
    if (!inputsValid) return;
    let live = true;
    setStatus("loading");
    const t = setTimeout(() => {
      const args = mode === "dimensions" ? { width_mm: a!, depth_mm: b! } : { cols: a!, rows: b! };
      computeGrid(mode, args)
        .then((res) => {
          if (!live) return;
          setResult(res);
          setStatus("ok");
        })
        .catch(() => live && setStatus("error"));
    }, 180);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [mode, a, b, inputsValid, retry]);

  const fits = !!result && result.cols > 0 && result.rows > 0;
  const tooSmall = mode === "dimensions" && inputsValid && (a! < GRID_UNIT || b! < GRID_UNIT);
  const maxU = maxBinU(heightMm);
  const tooShallow = maxU !== null && maxU < 2;
  const canCreate = status === "ok" && inputsValid && fits && !tooSmall && !heightInvalid;

  // bins that won't survive a smaller grid
  const lost = result && fits ? bins.filter((bn) => !inBounds({ cols: result.cols, rows: result.rows }, bn.x, bn.y, bn.w, bn.d)).length : 0;

  const switchUnit = (u: LengthUnit) => {
    if (u === unit) return;
    const conv = (txt: string) => {
      const mm = parseLength(txt, unit);
      return mm === null ? txt : formatLength(mm, u);
    };
    setWidthTxt(conv(widthTxt));
    setDepthTxt(conv(depthTxt));
    setHeightTxt(heightTxt.trim() ? conv(heightTxt) : "");
    setUnit(u);
  };

  const pick = (p: Picked) => {
    const w = p.kind === "preset" ? p.preset.inner.width_mm : p.size.widthMm;
    const d = p.kind === "preset" ? p.preset.inner.depth_mm : p.size.depthMm;
    const h = p.kind === "preset" ? p.preset.inner.height_mm : p.size.heightMm;
    setMode("dimensions");
    setWidthTxt(formatLength(w, unit));
    setDepthTxt(formatLength(d, unit));
    setHeightTxt(h ? formatLength(h, unit) : "");
    setPresetId(p.kind === "preset" ? p.preset.id : p.size.presetId && drawerById(p.size.presetId) ? p.size.presetId : null);
  };

  const create = () => {
    if (!canCreate || !result) return;
    const label = preset ? drawerLabel(preset) : null;
    const spec =
      mode === "dimensions"
        ? { widthMm: widthMm!, depthMm: depthMm!, heightMm, presetId: preset?.id ?? null, label }
        : { widthMm: result.plate_width_mm, depthMm: result.plate_depth_mm, heightMm, presetId: null, label: null };
    if (mode === "dimensions") rememberSize(spec);
    setDrawer(spec);
    setGrid({ cols: result.cols, rows: result.rows });
    if (lost) useStore.setState((s) => ({ bins: s.bins.filter((bn) => inBounds({ cols: result.cols, rows: result.rows }, bn.x, bn.y, bn.w, bn.d)) }));
    setStep("design");
  };

  return (
    <div className="setup">
      <header className="setup-bar">
        <Link to="/" aria-label="drawr home" style={{ textDecoration: "none", display: "flex" }}>
          <Wordmark />
        </Link>
        <span className="setup-step">Step 1 of 3</span>
      </header>

      <main className="setup-main">
        <section className="setup-form" aria-labelledby="setup-title">
          <h1 id="setup-title">What size is your drawer?</h1>
          <p className="setup-lede">
            Pick a common drawer, or measure the inside of yours. drawr fits as many 42&nbsp;mm
            units as it can and centers the baseplate in the space left over.
          </p>

          <DrawerPicker selected={preset} recent={recent} unit={unit} onPick={pick} onClear={() => setPresetId(null)} />

          <div className="setup-controls">
            <Segmented
              label="Size by"
              value={mode}
              onChange={setMode}
              options={[
                { value: "dimensions", label: "Drawer size", testid: "mode-dimensions" },
                { value: "units", label: "Unit count", testid: "mode-units" },
              ]}
            />
            <Segmented
              label="Units"
              size="sm"
              value={unit}
              onChange={switchUnit}
              options={[
                { value: "mm", label: "mm", testid: "unit-mm" },
                { value: "in", label: "in", testid: "unit-in" },
              ]}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <div className="setup-fields">
              {mode === "dimensions" ? (
                <>
                  <BigField id="w" label="Width" unit={unit} value={widthTxt} onChange={setWidthTxt} invalid={widthTxt !== "" && widthMm === null} />
                  <span className="setup-times" aria-hidden>×</span>
                  <BigField id="d" label="Depth" unit={unit} value={depthTxt} onChange={setDepthTxt} invalid={depthTxt !== "" && depthMm === null} />
                </>
              ) : (
                <>
                  <BigField id="c" label="Columns" unit="units" value={cols} onChange={setCols} integer />
                  <span className="setup-times" aria-hidden>×</span>
                  <BigField id="r" label="Rows" unit="units" value={rows} onChange={setRows} integer />
                </>
              )}
            </div>
            <div className="setup-height">
              <BigField id="h" label="Inside height (optional)" unit={unit} value={heightTxt} onChange={setHeightTxt}
                small placeholder="Limits bin height" invalid={heightInvalid} />
            </div>
            <button type="submit" hidden />
          </form>

          {preset && (
            <p className={`setup-source${preset.confidence === "medium" ? " medium" : ""}`} data-testid="drawer-source">
              {SOURCE_LABEL[preset.source_kind]}
              {preset.notes ? ` · ${preset.notes}` : ""}{" "}
              <a href={preset.source_url} target="_blank" rel="noreferrer">
                Source <ExternalLink size={11} />
              </a>
              <br />
              Drawers vary between production runs. Check yours with a tape measure.
            </p>
          )}

          <div className="setup-result" aria-live="polite">
            {!inputsValid ? (
              <p className="setup-msg">
                {mode === "dimensions" && unit === "in"
                  ? "Enter both measurements, like 11.75 or 11 3/4."
                  : "Enter both measurements to see what fits."}
              </p>
            ) : tooSmall ? (
              <p className="setup-msg bad">A drawer needs to be at least 42 mm in each direction to hold one unit.</p>
            ) : status === "error" ? (
              <div className="setup-msg bad" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <WifiOff size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>Couldn't reach the geometry service. Check your connection and try again.</span>
                <button type="button" className="btn btn-secondary" onClick={() => setRetry((n) => n + 1)}>
                  <RotateCw size={14} /> Retry
                </button>
              </div>
            ) : result ? (
              <dl className={`setup-dl${status === "loading" ? " stale" : ""}`}>
                <div>
                  <dt>Fits</dt>
                  <dd><span className="num setup-big">{result.cols} × {result.rows}</span> units</dd>
                </div>
                <div>
                  <dt>Baseplate</dt>
                  <dd className="num">{result.plate_width_mm} × {result.plate_depth_mm} mm</dd>
                </div>
                {mode === "dimensions" && (
                  <div>
                    <dt>Margin</dt>
                    <dd>
                      <span className="num">{result.margin_x_mm} mm</span> each side ·{" "}
                      <span className="num">{result.margin_y_mm} mm</span> front and back
                    </dd>
                  </div>
                )}
                {maxU !== null && (
                  <div>
                    <dt>Tallest bin</dt>
                    <dd data-testid="setup-max-height">
                      {tooShallow ? (
                        <span style={{ color: "var(--bad-ink)" }}>Too shallow for a 2 U bin</span>
                      ) : (
                        <><span className="num">{maxU} U</span> · <span className="num">{maxU * HEIGHT_UNIT} mm</span></>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="setup-msg"><Loader2 size={15} className="spin" /> Calculating…</p>
            )}
          </div>

          {lost > 0 && canCreate && (
            <p className="setup-msg warn" role="status" style={{ marginTop: 12 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              {lost} bin{lost !== 1 ? "s" : ""} won't fit the new grid and will be removed.
            </p>
          )}

          <button type="button" className="btn btn-primary btn-lg setup-cta" data-testid="generate-grid" onClick={create} disabled={!canCreate}>
            {bins.length ? "Update grid" : "Create grid"} <ArrowRight size={17} />
          </button>
        </section>

        <DrawerDiagram
          mode={mode}
          drawer={mode === "dimensions" && widthMm && depthMm ? { w: widthMm, d: depthMm } : null}
          result={result && fits && !tooSmall ? result : null}
          unit={unit}
        />
      </main>
    </div>
  );
}

function BigField({
  id, label, unit, value, onChange, integer, small, placeholder, invalid,
}: {
  id: string; label: string; unit: string; value: string; onChange: (v: string) => void;
  integer?: boolean; small?: boolean; placeholder?: string; invalid?: boolean;
}) {
  return (
    <label className={`big-field${small ? " small" : ""}${invalid ? " invalid" : ""}`} htmlFor={`setup-${id}`}>
      <span className="big-field-label">{label}</span>
      <span className="big-field-box">
        <input
          id={`setup-${id}`}
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="num"
        />
        <span className="big-field-unit">{unit}</span>
      </span>
    </label>
  );
}

/** A to-scale top view: the drawer's inside, and the baseplate centred in it. */
function DrawerDiagram({
  mode, drawer, result, unit,
}: { mode: Mode; drawer: { w: number; d: number } | null; result: GridComputeResult | null; unit: LengthUnit }) {
  const fmt = (mm: number) => `${formatLength(mm, unit)} ${unit}`;
  const plateW = result ? result.plate_width_mm : 0;
  const plateD = result ? result.plate_depth_mm : 0;
  const W = mode === "dimensions" && drawer ? Math.max(drawer.w, plateW) : plateW;
  const D = mode === "dimensions" && drawer ? Math.max(drawer.d, plateD) : plateD;

  if (!result || !W || !D) {
    return (
      <figure className="diagram empty" aria-hidden>
        <div className="diagram-empty">The baseplate preview appears here.</div>
      </figure>
    );
  }

  const pad = Math.max(W, D) * 0.16; // room for the dimension lines
  const px = (W - plateW) / 2;
  const py = (D - plateD) / 2;
  const s = Math.max(W, D) / 100; // 1% of the longest side, for strokes & text
  const cells: [number, number][] = [];
  for (let i = 0; i < result.cols; i++) for (let j = 0; j < result.rows; j++) cells.push([i, j]);
  const showDrawer = mode === "dimensions";

  return (
    <figure className="diagram">
      <svg
        viewBox={`${-pad} ${-pad} ${W + pad * 1.4} ${D + pad * 1.4}`}
        role="img"
        aria-label={`Top view: ${result.cols} by ${result.rows} unit baseplate${showDrawer && drawer ? ` inside a ${drawer.w} by ${drawer.d} mm drawer` : ""}`}
      >
        {showDrawer && (
          <rect x={0} y={0} width={W} height={D} rx={s * 1.6} className="d-drawer" strokeWidth={s * 0.35} strokeDasharray={`${s * 1.4} ${s * 1}`} />
        )}
        <g transform={`translate(${px} ${py})`}>
          <rect x={0} y={0} width={plateW} height={plateD} rx={4} className="d-plate" strokeWidth={s * 0.2} />
          {cells.map(([i, j]) => (
            <rect key={`${i}-${j}`} x={i * GRID_UNIT + 2.2} y={j * GRID_UNIT + 2.2} width={GRID_UNIT - 4.4} height={GRID_UNIT - 4.4} rx={3.2} className="d-cell" />
          ))}
        </g>

        {/* width dimension (top) */}
        <Dim x1={showDrawer ? 0 : px} x2={showDrawer ? W : px + plateW} y={-pad * 0.45} s={s}
          label={fmt(showDrawer && drawer ? drawer.w : plateW)} />
        {/* depth dimension (left) */}
        <Dim vertical x1={showDrawer ? 0 : py} x2={showDrawer ? D : py + plateD} y={-pad * 0.45} s={s}
          label={fmt(showDrawer && drawer ? drawer.d : plateD)} />
        {/* plate dimension (bottom), only when it differs from the drawer */}
        {showDrawer && (
          <Dim x1={px} x2={px + plateW} y={D + pad * 0.38} s={s} label={`${fmt(plateW)} plate`} accent />
        )}
      </svg>
      <figcaption className="diagram-cap">
        {showDrawer ? "Drawer outline (dashed) and baseplate, to scale" : "Baseplate, to scale"}
      </figcaption>
    </figure>
  );
}

function Dim({
  x1, x2, y, s, label, vertical, accent,
}: { x1: number; x2: number; y: number; s: number; label: string; vertical?: boolean; accent?: boolean }) {
  // Vertical dims are drawn as horizontal ones in a frame rotated -90°, where
  // (x, y) lands at (y, -x): so negate the span to run top-to-bottom.
  const [a, b] = vertical ? [-x2, -x1] : [x1, x2];
  const t = s * 1.2; // tick half-length
  const mid = (a + b) / 2;
  const fs = s * 2.6;
  const gap = label.length * fs * 0.3 + s;
  return (
    <g className={`d-dim${accent ? " accent" : ""}`} strokeWidth={s * 0.22} transform={vertical ? "rotate(-90)" : undefined}>
      <line x1={a} y1={y} x2={mid - gap} y2={y} />
      <line x1={mid + gap} y1={y} x2={b} y2={y} />
      <line x1={a} y1={y - t} x2={a} y2={y + t} />
      <line x1={b} y1={y - t} x2={b} y2={y + t} />
      <text x={mid} y={y} dy="0.35em" textAnchor="middle" fontSize={fs} stroke="none">
        {label}
      </text>
    </g>
  );
}
