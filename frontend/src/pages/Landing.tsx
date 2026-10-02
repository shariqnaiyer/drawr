import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, FileBox } from "lucide-react";
import { Mark, Wordmark } from "../components/ui";
import { FILAMENTS, filament, type FilamentId } from "../lib/filament";
import { MODELS, licenseInfo } from "../catalog";
import "./landing.css";

const TITLE = "drawr — design Gridfinity drawers, export print-ready STLs";
const REPO = "https://github.com/shariqnaiyer/gridfinity-studio";

// lucide dropped brand glyphs, so the GitHub mark is inline.
function Github({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.21a11.5 11.5 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.65.24 2.87.12 3.17.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.82.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

// ---- isometric drawer -----------------------------------------------------
// A 7×5 baseplate drawn in CSS 3D. Each bin is a real extruded box (top face +
// the two faces the camera sees) that drops into its socket on load.

type IsoBin = {
  x: number; y: number; w: number; d: number;
  h: number; // extrusion in px
  f: FilamentId;
  cols?: number; rows?: number;
  label?: boolean;
};

const HERO_BINS: IsoBin[] = [
  { x: 0, y: 0, w: 3, d: 2, h: 26, f: "graphite", cols: 3, label: true },
  { x: 3, y: 0, w: 2, d: 1, h: 34, f: "coral", label: true },
  { x: 5, y: 0, w: 2, d: 2, h: 22, f: "sun", rows: 2 },
  { x: 3, y: 1, w: 2, d: 2, h: 44, f: "blue", cols: 2, label: true },
  { x: 1, y: 2, w: 2, d: 1, h: 20, f: "cloud", cols: 2 },
  { x: 5, y: 2, w: 2, d: 1, h: 30, f: "graphite", label: true },
  { x: 0, y: 3, w: 3, d: 2, h: 34, f: "lilac", cols: 2, label: true },
  { x: 3, y: 3, w: 2, d: 2, h: 26, f: "mint", rows: 2 },
  { x: 5, y: 3, w: 2, d: 2, h: 38, f: "cloud", cols: 2, rows: 2, label: true },
];

/** Divider lines + cavity for a bin top, as layered backgrounds. */
function topStyle(b: IsoBin, cell: number): CSSProperties {
  const fl = filament(b.f);
  const layers: string[] = [];
  const cols = b.cols ?? 1;
  const rows = b.rows ?? 1;
  for (let k = 1; k < cols; k++) {
    const p = (k / cols) * 100;
    layers.push(`linear-gradient(90deg, transparent calc(${p}% - 1.5px), ${fl.face} calc(${p}% - 1.5px), ${fl.face} calc(${p}% + 1.5px), transparent calc(${p}% + 1.5px))`);
  }
  for (let k = 1; k < rows; k++) {
    const p = (k / rows) * 100;
    layers.push(`linear-gradient(180deg, transparent calc(${p}% - 1.5px), ${fl.face} calc(${p}% - 1.5px), ${fl.face} calc(${p}% + 1.5px), transparent calc(${p}% + 1.5px))`);
  }
  // label lip along the back wall
  if (b.label) layers.push(`linear-gradient(180deg, ${fl.face} 0, ${fl.face} ${Math.round(cell * 0.2)}px, transparent ${Math.round(cell * 0.2)}px)`);
  layers.push(`linear-gradient(160deg, ${fl.side}, ${fl.deep})`);
  return {
    background: layers.join(","),
    boxShadow: `inset 0 0 0 3px ${fl.face}, inset 0 0 0 4px rgba(255,255,255,.12)`,
  };
}

function IsoBox({ b, cell, delay }: { b: IsoBin; cell: number; delay?: number }) {
  const fl = filament(b.f);
  const inset = 3;
  const W = b.w * cell - inset * 2;
  const D = b.d * cell - inset * 2;
  return (
    <div
      className="iso-bin"
      style={{
        left: b.x * cell + inset,
        top: b.y * cell + inset,
        width: W,
        height: D,
        animationDelay: delay != null ? `${delay}ms` : undefined,
      }}
    >
      <div className="iso-face iso-top" style={{ transform: `translateZ(${b.h}px)`, ...topStyle(b, cell) }} />
      <div className="iso-face iso-front" style={{ top: D, width: W, height: b.h, background: `linear-gradient(0deg, ${fl.side}, ${fl.face})` }} />
      <div className="iso-face iso-right" style={{ left: W, width: b.h, height: D, background: `linear-gradient(270deg, ${fl.deep}, ${fl.side})` }} />
    </div>
  );
}

function Sockets({ cols, rows, cell }: { cols: number; rows: number; cell: number }) {
  return (
    <svg className="iso-sockets" width={cols * cell} height={rows * cell} aria-hidden>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const x = (i % cols) * cell;
        const y = Math.floor(i / cols) * cell;
        return <rect key={i} x={x + 4} y={y + 4} width={cell - 8} height={cell - 8} rx={7} />;
      })}
    </svg>
  );
}

function IsoDrawer() {
  const cell = 60;
  const cols = 7;
  const rows = 5;
  const W = cols * cell;
  const D = rows * cell;
  return (
    <div className="iso-scale">
      <div className="iso-world" style={{ width: W, height: D }}>
        <div className="iso-plate" style={{ width: W, height: D }}>
          <Sockets cols={cols} rows={rows} cell={cell} />
          <div className="iso-face iso-slab-front" style={{ top: D, width: W }} />
          <div className="iso-face iso-slab-right" style={{ left: W, height: D }} />
        </div>
        {/* dimension callouts, drawn in the plate's plane like a drafting sheet */}
        <div className="iso-dim iso-dim-w" style={{ top: D + 30, width: W }}>
          <span className="num">294 mm</span>
        </div>
        <div className="iso-dim iso-dim-d" style={{ left: W + 30, height: D }}>
          <span className="num">210 mm</span>
        </div>
        {HERO_BINS.map((b, i) => (
          <IsoBox key={i} b={b} cell={cell} delay={250 + i * 90} />
        ))}
      </div>
    </div>
  );
}

// ---- product window mock ---------------------------------------------------

const MOCK_BINS: { x: number; y: number; w: number; d: number; f: FilamentId; cols?: number; sel?: boolean }[] = [
  { x: 0, y: 0, w: 3, d: 2, f: "graphite", cols: 3, sel: true },
  { x: 3, y: 0, w: 2, d: 1, f: "coral" },
  { x: 5, y: 0, w: 1, d: 1, f: "sun" },
  { x: 3, y: 1, w: 3, d: 2, f: "blue", cols: 2 },
  { x: 0, y: 2, w: 2, d: 2, f: "mint" },
  { x: 2, y: 3, w: 2, d: 1, f: "lilac" },
];

function EditorMock() {
  const cols = 6;
  const rows = 4;
  return (
    <figure className="mock" aria-label="The drawr editor: a 6 by 4 grid with six bins, the selected bin's settings on the right">
      <div className="mock-bar" aria-hidden>
        <span className="mock-lights"><i /><i /><i /></span>
        <span className="mock-brand"><Mark size={16} /> drawr</span>
        <span className="mock-crumbs">Setup <ChevronRight size={12} /> <b>Design</b> <ChevronRight size={12} /> Export</span>
        <span className="seg sm mock-seg"><button type="button" tabIndex={-1} aria-pressed="true">2D</button><button type="button" tabIndex={-1} aria-pressed="false">3D</button></span>
        <span className="mock-export">Export</span>
      </div>
      <div className="mock-body" aria-hidden>
        <div className="mock-canvas">
          <div className="mock-plate" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols} / ${rows}` }}>
            {Array.from({ length: cols * rows }).map((_, i) => <span key={i} className="mock-socket" />)}
            {MOCK_BINS.map((b, i) => {
              const fl = filament(b.f);
              return (
                <span
                  key={i}
                  className={`mock-bin${b.sel ? " sel" : ""}`}
                  style={{
                    left: `calc(${(b.x / cols) * 100}% + 3px)`,
                    top: `calc(${(b.y / rows) * 100}% + 3px)`,
                    width: `calc(${(b.w / cols) * 100}% - 6px)`,
                    height: `calc(${(b.d / rows) * 100}% - 6px)`,
                    background: `linear-gradient(160deg, ${fl.face}, ${fl.side})`,
                    color: fl.ink,
                  }}
                >
                  {Array.from({ length: (b.cols ?? 1) - 1 }).map((_, k) => (
                    <i key={k} style={{ left: `${((k + 1) / (b.cols ?? 1)) * 100}%` }} />
                  ))}
                  <em className="num">{b.w}×{b.d}</em>
                </span>
              );
            })}
          </div>
          <div className="mock-dock">
            <span className="on" /><span /><span /><s /><span /><span /><span />
          </div>
        </div>
        <div className="mock-insp">
          <div className="mock-insp-title">Bin · 3×2</div>
          <div className="mock-insp-sub num">125.5 × 83.5 mm</div>
          <div className="mock-group-label">Height</div>
          <div className="mock-height"><b className="num">42 mm</b><span className="num">6 U</span></div>
          <div className="mock-slider"><i /></div>
          <div className="mock-group-label">Features</div>
          <div className="mock-rows">
            {[["Label tab", true], ["Scoop", true], ["Magnet holes", true], ["Screw holes", false]].map(([l, on]) => (
              <div key={l as string} className="mock-row">
                <span>{l}</span>
                <span className="switch" aria-checked={on as boolean} role="presentation" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

// ---- bento visuals ---------------------------------------------------------

function DrawVisual() {
  const cols = 8;
  const rows = 3;
  return (
    <div className="v-draw" aria-hidden>
      <div className="v-draw-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => <span key={i} />)}
        <i className="v-draw-bin" style={{ left: "0%", top: "0%", width: "25%", height: "66.66%", background: filament("graphite").face }} />
        <i className="v-draw-rect" />
      </div>
      <div className="v-draw-tags">
        <span className="v-tag num">3×2</span>
      </div>
    </div>
  );
}

function DetailVisual() {
  const rows: [string, boolean][] = [
    ["Label tab", true],
    ["Scoop ramp", true],
    ["Magnet holes", true],
    ["Screw holes", false],
    ["Solid lid", false],
  ];
  return (
    <div className="v-detail" aria-hidden>
      <div className="v-detail-height">
        <span>Height</span>
        <b className="num">84 mm · 12 U</b>
      </div>
      <div className="v-slider"><i style={{ width: "55%" }} /><em style={{ left: "55%" }} /></div>
      <div className="v-detail-comp">
        <span>Compartments</span>
        <span className="v-comp">{Array.from({ length: 6 }).map((_, i) => <i key={i} />)}</span>
        <b className="num">3 × 2</b>
      </div>
      <ul className="v-list">
        {rows.map(([l, on]) => (
          <li key={l}>
            <span>{l}</span>
            <span className="switch" role="presentation" aria-checked={on} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Live3DVisual() {
  const bins: IsoBin[] = [
    { x: 0, y: 0, w: 2, d: 1, h: 30, f: "blue", cols: 2, label: true },
    { x: 0, y: 1, w: 1, d: 1, h: 18, f: "sun" },
    { x: 1, y: 1, w: 1, d: 1, h: 42, f: "coral", label: true },
  ];
  const cell = 52;
  return (
    <div className="v-3d" aria-hidden>
      <div className="iso-world small" style={{ width: cell * 2, height: cell * 2 }}>
        <div className="iso-plate" style={{ width: cell * 2, height: cell * 2 }}>
          <Sockets cols={2} rows={2} cell={cell} />
        </div>
        {bins.map((b, i) => <IsoBox key={i} b={b} cell={cell} />)}
      </div>
      <span className="v-hint">Drag to orbit</span>
    </div>
  );
}

function ExportVisual() {
  const files = [
    ["baseplate_7x5.stl", "× 1"],
    ["bin_3x2x6u_c3x1_lab1_sco1_mag1_scr0.stl", "× 2"],
    ["bin_2x1x4u_c1x1_lab1_sco1_mag1_scr0.stl", "× 4"],
    ["bin_1x1x3u_c1x1_lab0_sco1_mag1_scr0.stl", "× 6"],
    ["bin_2x2x6u_c2x2_lab1_sco0_mag1_scr1.stl", "× 1"],
    ["bin_4x1x3u_c4x1_lab1_sco1_mag0_scr0.stl", "× 2"],
    ["CREDITS.md", ""],
  ];
  return (
    <div className="v-export" aria-hidden>
      <div className="v-zip"><FileBox size={15} /> drawr-7x5.zip</div>
      <ul>
        {files.map(([n, q]) => (
          <li key={n}><span className="mono">{n}</span><em className="num">{q}</em></li>
        ))}
      </ul>
    </div>
  );
}

const LIB_PICKS = ["printables-universal-screwdriver-holder-audacity", "gridfinity-rebuilt-openscad"];

function LibraryVisual() {
  const picks = [
    ...MODELS.filter((m) => LIB_PICKS.includes(m.id)),
    ...MODELS.filter((m) => m.license.includes("NC")).slice(0, 1),
  ].slice(0, 3);
  return (
    <ul className="v-lib" aria-hidden>
      {picks.map((m) => {
        const lic = licenseInfo(m.license);
        const tone = lic.tone === "ok" ? "ok" : lic.tone === "attribution" ? "accent" : lic.tone === "noncommercial" ? "warn" : "bad";
        return (
          <li key={m.id}>
            <span className="v-lib-thumb" />
            <span className="v-lib-text">
              <b>{m.title}</b>
              <span>by {m.author}</span>
            </span>
            <span className={`badge ${tone}`}>{lic.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FilamentVisual() {
  return (
    <ul className="v-fil" aria-label="Preview colors">
      {FILAMENTS.map((f) => (
        <li key={f.id}>
          <span className="v-fil-swatch" style={{ background: `radial-gradient(circle, var(--paper) 0 17%, rgba(0,0,0,.18) 17% 20%, transparent 20%), repeating-radial-gradient(circle, transparent 0 3px, rgba(0,0,0,.06) 3px 4px), linear-gradient(150deg, ${f.face} 40%, ${f.side})` }} />
          <span>{f.name}</span>
        </li>
      ))}
    </ul>
  );
}

// ---- spec drawing ------------------------------------------------------------

function ProfileDrawing() {
  const s = 52; // px per mm
  const ox = 70; // origin x
  const oy = 300; // origin y (baseline)
  const P = (x: number, y: number) => `${ox + x * s},${oy - y * s}`;
  const body = [P(0, 0), P(0.8, 0.8), P(0.8, 2.6), P(2.95, 4.95), P(3.7, 4.95), P(3.7, 0)].join(" ");
  const edge = [P(0, 0), P(0.8, 0.8), P(0.8, 2.6), P(2.95, 4.95)].join(" ");
  const rx = ox + 3.7 * s + 34; // right dimension column
  const ticks: [number, number, string][] = [
    [0, 0.8, "0.8"],
    [0.8, 2.6, "1.8"],
    [2.6, 4.95, "2.35"],
  ];
  return (
    <svg className="profile" viewBox="0 0 440 360" role="img" aria-labelledby="profile-t">
      <title id="profile-t">Gridfinity foot profile: 0.8 mm chamfer, 1.8 mm vertical wall, 2.35 mm chamfer; 4.95 mm total height</title>
      <defs>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.2" />
        </pattern>
      </defs>
      {/* grid */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`h${i}`} x1={ox - 20} x2={ox + 3.7 * s} y1={oy - i * s} y2={oy - i * s} className="pf-grid" />
      ))}
      <polygon points={body} fill="url(#hatch)" />
      <polyline points={edge} className="pf-edge" />
      <line x1={ox - 30} x2={ox + 3.7 * s + 10} y1={oy} y2={oy} className="pf-base" />
      {/* vertices */}
      {[[0, 0], [0.8, 0.8], [0.8, 2.6], [2.95, 4.95]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={ox + x * s} cy={oy - y * s} r="3.5" className="pf-node" />
      ))}
      {/* segment heights */}
      {ticks.map(([a, b, l]) => (
        <g key={l}>
          <line x1={rx} x2={rx} y1={oy - a * s} y2={oy - b * s} className="pf-dim" />
          <line x1={rx - 5} x2={rx + 5} y1={oy - a * s} y2={oy - a * s} className="pf-dim" />
          <line x1={rx - 5} x2={rx + 5} y1={oy - b * s} y2={oy - b * s} className="pf-dim" />
          <text x={rx + 12} y={oy - ((a + b) / 2) * s + 4} className="pf-label">{l}</text>
        </g>
      ))}
      {/* total */}
      <line x1={rx + 62} x2={rx + 62} y1={oy} y2={oy - 4.95 * s} className="pf-dim strong" />
      <line x1={rx + 56} x2={rx + 68} y1={oy} y2={oy} className="pf-dim strong" />
      <line x1={rx + 56} x2={rx + 68} y1={oy - 4.95 * s} y2={oy - 4.95 * s} className="pf-dim strong" />
      <text x={rx + 74} y={oy - 2.475 * s + 4} className="pf-label strong">4.95</text>
      {/* widths along the top */}
      <line x1={ox} x2={ox + 0.8 * s} y1={30} y2={30} className="pf-dim" />
      <line x1={ox + 0.8 * s} x2={ox + 2.95 * s} y1={30} y2={30} className="pf-dim" />
      {[0, 0.8, 2.95].map((x) => (
        <line key={x} x1={ox + x * s} x2={ox + x * s} y1={24} y2={36} className="pf-dim" />
      ))}
      <text x={ox + 0.4 * s} y={20} textAnchor="middle" className="pf-label">0.8</text>
      <text x={ox + 1.875 * s} y={20} textAnchor="middle" className="pf-label">2.15</text>
      <text x={ox - 26} y={oy + 26} className="pf-caption">mm · section through bin foot</text>
    </svg>
  );
}

const SPEC: [string, string, string?][] = [
  ["Grid pitch", "42.0 mm"],
  ["Height unit", "7.0 mm"],
  ["Bin footprint", "41.5 mm", "0.25 mm clearance per side"],
  ["Foot height", "4.95 mm"],
  ["Magnet hole", "Ø6.0 × 2.0 mm"],
  ["Screw hole", "Ø3.0 mm", "M3"],
  ["Base corner radius", "3.75 mm"],
];

// ---- timeline glyphs ---------------------------------------------------------

function GlyphMeasure() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <rect x="2.5" y="9" width="23" height="10" rx="2" />
      <path d="M7 9v4M11.5 9v2.5M16 9v4M20.5 9v2.5" />
    </svg>
  );
}
function GlyphArrange() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="13" height="9" rx="2" fill="currentColor" fillOpacity=".18" />
      <rect x="18" y="3" width="7" height="9" rx="2" />
      <rect x="3" y="15" width="7" height="10" rx="2" />
      <rect x="12" y="15" width="13" height="10" rx="2" />
    </svg>
  );
}
function GlyphPrint() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3v13M9 11l5 5 5-5" />
      <path d="M4 17v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

const TIMELINE = [
  { glyph: <GlyphMeasure />, title: "Measure", body: "Enter your drawer's inner width and depth. drawr works out how many 42 mm units fit and shows the leftover margin." },
  { glyph: <GlyphArrange />, title: "Arrange", body: "Click or drag to place bins, then tune each one: height, dividers, label tab, scoop, magnets and screws." },
  { glyph: <GlyphPrint />, title: "Print", body: "Download one ZIP with the baseplate and every unique bin as a watertight STL, ready for your slicer." },
];

// ---- page ------------------------------------------------------------------

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = TITLE;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp">
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`} aria-label="Main">
        <div className="lp-nav-inner">
          <Link to="/" aria-label="drawr home" className="lp-home"><Wordmark /></Link>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#spec">Spec</a>
            <a href={REPO} target="_blank" rel="noreferrer" className="lp-gh"><Github size={15} /> GitHub</a>
          </div>
          <Link className="btn btn-primary" to="/app" data-testid="nav-open-editor">Open drawr</Link>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-hero-copy">
          <h1 className="lp-h1">Every drawer, perfectly organized.</h1>
          <p className="lp-sub">
            Measure your drawer, lay out Gridfinity bins, preview them in 3D, and download
            watertight STLs, all in your browser.
          </p>
          <div className="lp-hero-cta">
            <Link className="btn btn-primary btn-lg" to="/app" data-testid="hero-open-editor">
              Start designing
            </Link>
            <a className="lp-more" href="#how">See how it works <ChevronRight size={16} /></a>
          </div>
        </div>
        <div className="lp-stage">
          <div className="lp-field" aria-hidden>
            <i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /><i className="b5" />
          </div>
          <div className="lp-stage-object" role="img" aria-label="An isometric 7 by 5 Gridfinity baseplate, 294 by 210 millimetres, filled with colored bins">
            <IsoDrawer />
          </div>
        </div>
      </header>

      <section className="lp-section lp-window" aria-labelledby="window-h">
        <div className="lp-window-copy">
          <h2 id="window-h" className="lp-h2">One window, start to finish.</h2>
          <p className="lp-lede">
            No CAD, no plugins, no account. drawr keeps the whole job on one screen, from the
            drawer's measurements to the files your slicer opens.
          </p>
          <dl className="lp-stages">
            <div>
              <dt>Setup</dt>
              <dd>Type the drawer's inner size or a unit count. The CAD backend computes the grid, so the numbers on screen are the numbers it builds.</dd>
            </div>
            <div>
              <dt>Design</dt>
              <dd>Lay out bins on a true-to-scale grid with an inspector for every setting, and a live 3D view one click away.</dd>
            </div>
            <div>
              <dt>Export</dt>
              <dd>Review the part list with quantities, choose whether to include the baseplate, and download the ZIP.</dd>
            </div>
          </dl>
        </div>
        <EditorMock />
      </section>

      <section className="lp-section" id="features" aria-labelledby="features-h">
        <div className="lp-head">
          <h2 id="features-h" className="lp-h2">Small parts. Every detail.</h2>
          <p className="lp-lede">Everything you need to fill a drawer, and nothing that gets in the way.</p>
        </div>
        <div className="bento">
          <article className="tile t-draw">
            <div className="tile-copy">
              <h3>Draw any size.</h3>
              <p>Click to drop a preset footprint, or drag across cells to draw your own. Move bins anywhere. Overlaps and out-of-bounds spots are blocked before you let go.</p>
            </div>
            <DrawVisual />
          </article>
          <article className="tile t-3d">
            <Live3DVisual />
            <div className="tile-copy">
              <h3>Live 3D.</h3>
              <p>The preview renders in your browser, so it updates the moment you change something.</p>
            </div>
          </article>
          <article className="tile t-detail">
            <div className="tile-copy">
              <h3>Every detail, per bin.</h3>
              <p>Height from 2 to 20 U, dividers in both directions, label tab, scoop ramp, magnet and screw holes, or a solid lid.</p>
            </div>
            <DetailVisual />
          </article>
          <article className="tile t-export">
            <div className="tile-copy">
              <h3>Watertight export.</h3>
              <p>One ZIP. One STL per unique part, de-duplicated and named for what it is.</p>
            </div>
            <ExportVisual />
          </article>
          <article className="tile t-lib">
            <div className="tile-copy">
              <h3>A community library, credited.</h3>
              <p>
                Search {MODELS.length} indexed community models, each with its verified license.
                Files stay at their source. Permissive generators become real bins you can edit.
              </p>
            </div>
            <LibraryVisual />
          </article>
          <article className="tile t-fil">
            <div className="tile-copy">
              <h3>Pick your filament.</h3>
              <p>See the layout in the color you'll print it in before you start the printer.</p>
            </div>
            <FilamentVisual />
          </article>
        </div>
      </section>

      <section className="lp-spec" id="spec" aria-labelledby="spec-h">
        <div className="lp-spec-inner">
          <div className="lp-spec-copy">
            <h2 id="spec-h" className="lp-h2">Dimensionally correct, by design.</h2>
            <p>
              Geometry is generated by build123d on the OpenCascade kernel. Every constant is
              cross-checked against kennetek's gridfinity-rebuilt-openscad, Zack Freedman's
              specification, and cq-gridfinity, and every exported mesh is verified watertight.
            </p>
            <table className="spec-table">
              <tbody>
                {SPEC.map(([k, v, note]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td><span className="num">{v}</span>{note && <span className="spec-note">{note}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="spec-credit">Built on the Gridfinity standard created by Zack Freedman.</p>
          </div>
          <div className="lp-spec-figure">
            <ProfileDrawing />
          </div>
        </div>
      </section>

      <section className="lp-section" id="how" aria-labelledby="how-h">
        <div className="lp-head">
          <h2 id="how-h" className="lp-h2">From tape measure to print bed.</h2>
        </div>
        <ol className="timeline">
          {TIMELINE.map((s) => (
            <li key={s.title}>
              <span className="tl-glyph">{s.glyph}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-cta" aria-labelledby="cta-h">
        <h2 id="cta-h">Build your first drawer.</h2>
        <p>Free and open source. No account needed.</p>
        <Link className="btn btn-primary btn-lg" to="/app" data-testid="cta-open-editor">
          Start designing <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Wordmark size={15} />
          <div className="lp-footer-links">
            <a href={REPO} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>
            <Link to="/app">Open drawr <ArrowRight size={14} /></Link>
          </div>
          <p>MIT licensed · Gridfinity by Zack Freedman</p>
        </div>
      </footer>
    </div>
  );
}
