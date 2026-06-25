import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Grid3x3, MousePointer2, SlidersHorizontal, Box, Package, Ruler,
  Check, ArrowRight, Layers,
} from "lucide-react";
import "./landing.css";

// lucide dropped brand glyphs, so the GitHub mark is inline.
function Github({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.58-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.21a11.5 11.5 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.65.24 2.87.12 3.17.77.83 1.23 1.88 1.23 3.17 0 4.53-2.81 5.53-5.49 5.82.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.82.57A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"/>
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} style={{ opacity: i === 4 ? 0.45 : 1 }} />
      ))}
    </div>
  );
}

const REPO = "https://github.com/shariqnaiyer/gridfinity-studio";

// ---- decorative hero board ------------------------------------------------
const CELL = 52;
const GAP = 6;
const COLS = 6;
const ROWS = 4;
type B = { x: number; y: number; w: number; h: number; label: string; accent?: boolean };
const HERO_BINS: B[] = [
  { x: 0, y: 0, w: 3, h: 2, label: "3×2", accent: true },
  { x: 3, y: 0, w: 2, h: 1, label: "2×1" },
  { x: 5, y: 0, w: 1, h: 1, label: "1×1" },
  { x: 3, y: 1, w: 2, h: 2, label: "2×2" },
  { x: 5, y: 1, w: 1, h: 1, label: "" },
  { x: 0, y: 2, w: 2, h: 1, label: "2×1" },
  { x: 2, y: 2, w: 1, h: 1, label: "" },
  { x: 5, y: 2, w: 1, h: 1, label: "" },
  { x: 0, y: 3, w: 3, h: 1, label: "3×1" },
  { x: 3, y: 3, w: 2, h: 1, label: "2×1" },
  { x: 5, y: 3, w: 1, h: 1, label: "" },
];
const px = (n: number) => n * (CELL + GAP);
const sz = (n: number) => n * CELL + (n - 1) * GAP;

function HeroBoard() {
  return (
    <div className="lp-board-wrap">
      <div className="lp-board-chip"><Ruler size={12} /> 1 U = 42 mm</div>
      <div
        className="lp-board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          width: COLS * CELL + (COLS - 1) * GAP,
          height: ROWS * CELL + (ROWS - 1) * GAP,
          position: "relative",
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => (
          <div key={i} className="lp-cell" />
        ))}
        {HERO_BINS.map((b, i) => (
          <div
            key={i}
            className={`lp-bin${b.accent ? " accent" : ""}`}
            style={{ left: px(b.x), top: px(b.y), width: sz(b.w), height: sz(b.h) }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: <Grid3x3 size={20} />, title: "Visual grid editor", body: "Lay out bins on a true-to-scale top-down grid. Occupied cells, dimensions and heights are always visible." },
  { icon: <MousePointer2 size={20} />, title: "Drag to draw", body: "Click to drop a preset footprint, or drag across cells to draw any size. Move and resize bins freely — overlaps are blocked." },
  { icon: <SlidersHorizontal size={20} />, title: "Parametric bins", body: "Per-bin height in U, internal dividers, label tabs, scoop ramps, and magnet or screw holes — all toggleable." },
  { icon: <Box size={20} />, title: "Instant 3D preview", body: "See the assembled set in 3D as you edit. Rendered live in the browser, so it updates with zero lag." },
  { icon: <Package size={20} />, title: "Watertight export", body: "Download a ZIP of manifold, print-ready STLs — one file per unique part, sensibly named, deduplicated." },
  { icon: <Ruler size={20} />, title: "Real Gridfinity spec", body: "Every dimension is cross-checked against the canonical sources, so prints seat into real baseplates." },
];

const STEPS = [
  { n: "01", title: "Set up the grid", body: "Enter your drawer's inner size or a unit count — the app computes the other and shows the resulting baseplate and margins." },
  { n: "02", title: "Design the layout", body: "Place and tune bins on the canvas. Adjust footprint, height, compartments and features in the inspector." },
  { n: "03", title: "Export & print", body: "Download the baseplate and every unique bin as watertight STLs, ready to slice and 3D print." },
];

export default function Landing() {
  useEffect(() => {
    document.title = "Gridfinity Studio — design & export Gridfinity bins";
  }, []);

  return (
    <div className="lp">
      {/* nav */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <BrandMark />
          Gridfinity Studio
        </div>
        <div className="lp-nav-actions">
          <a className="lp-nav-link hide-sm" href={REPO} target="_blank" rel="noreferrer">
            <Github size={16} /> GitHub
          </a>
          <Link className="lp-btn lp-btn-primary lp-btn-sm" to="/app" data-testid="nav-open-editor">
            Open editor <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* hero */}
      <header className="lp-hero">
        <div>
          <span className="lp-eyebrow"><Layers size={13} /> Parametric · open source</span>
          <h1 className="lp-h1">
            Design <em>Gridfinity</em> storage,<br />export print-ready STLs.
          </h1>
          <p className="lp-sub">
            A visual editor for the Gridfinity standard. Lay out bins on a grid, tune every
            detail, preview in 3D, and export watertight meshes generated by a real CAD kernel.
          </p>
          <div className="lp-hero-cta">
            <Link className="lp-btn lp-btn-primary" to="/app" data-testid="hero-open-editor">
              Open the editor <ArrowRight size={16} />
            </Link>
            <a className="lp-btn lp-btn-ghost" href={REPO} target="_blank" rel="noreferrer">
              <Github size={16} /> View source
            </a>
          </div>
          <div className="lp-hero-meta">
            <div><b>42 mm</b> grid standard</div>
            <div><b>watertight</b> STL output</div>
            <div><b>$0</b> open source</div>
          </div>
        </div>
        <HeroBoard />
      </header>

      {/* trust strip */}
      <div className="lp-trust">
        <div className="lp-trust-inner">
          <span className="lp-trust-item"><Check size={16} /> Dimensionally accurate</span>
          <span className="lp-trust-item"><Check size={16} /> Manifold / watertight meshes</span>
          <span className="lp-trust-item"><Check size={16} /> Seats into real baseplates</span>
          <span className="lp-trust-item"><Check size={16} /> No account required</span>
        </div>
      </div>

      {/* features */}
      <section className="lp-section">
        <div className="lp-section-head">
          <h2>Everything you need to design a drawer</h2>
          <p>From a blank grid to a folder of STLs — without leaving the browser.</p>
        </div>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div className="lp-card" key={f.title}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="lp-section" style={{ paddingTop: 0 }}>
        <div className="lp-section-head">
          <h2>Three steps to printed parts</h2>
          <p>The editor walks you from drawer dimensions to a slice-ready export.</p>
        </div>
        <div className="lp-steps">
          {STEPS.map((s) => (
            <div className="lp-step" key={s.n}>
              <div className="lp-step-n">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* dimensional accuracy band */}
      <section className="lp-spec">
        <div className="lp-spec-inner">
          <div>
            <h2>Dimensionally correct, by design</h2>
            <p>
              Geometry is generated by build123d on the OpenCascade kernel — the same class of
              CAD engine used for real parts. Every constant is cross-checked against the
              canonical Gridfinity sources, and each exported mesh is verified watertight.
            </p>
            <p style={{ color: "#7e8893", fontSize: 14 }}>
              Built on the Gridfinity standard created by Zack Freedman.
            </p>
          </div>
          <div className="lp-spec-grid">
            <div className="lp-spec-stat"><b>42.0 mm</b><span>grid pitch · 7 mm height unit</span></div>
            <div className="lp-spec-stat"><b>41.5 mm</b><span>footprint · 0.25 mm clearance/side</span></div>
            <div className="lp-spec-stat"><b>watertight</b><span>manifold meshes, every part</span></div>
            <div className="lp-spec-stat"><b>3 sources</b><span>cross-checked dimensions</span></div>
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="lp-cta">
        <h2>Build your first drawer.</h2>
        <p>Open the editor and have an exportable layout in a couple of minutes.</p>
        <Link className="lp-btn lp-btn-primary" to="/app" style={{ height: 50, padding: "0 26px", fontSize: 15 }}>
          Open the editor <ArrowRight size={17} />
        </Link>
      </section>

      {/* footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-nav-brand" style={{ fontSize: 14 }}>
            <BrandMark /> Gridfinity Studio
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <a href={REPO} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Github size={15} /> GitHub</a>
            <Link to="/app" style={{ color: "var(--muted)", textDecoration: "none" }}>Open editor</Link>
          </div>
          <div>MIT licensed · Gridfinity by Zack Freedman</div>
        </div>
      </footer>
    </div>
  );
}
