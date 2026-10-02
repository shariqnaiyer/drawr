import { useMemo, useState } from "react";
import { Search, ExternalLink, Plus, Check, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useStore, canPlace } from "../store";
import { searchCatalog, licenseInfo, CATEGORIES, type Category, type CatalogModel } from "../catalog";
import type { Grid, Bin, ModelRef } from "../types";
import { Sheet, Switch } from "./ui";

// First free top-left cell that fits a w x d footprint, or null if none.
function firstFreeSpot(grid: Grid, bins: Bin[], w: number, d: number) {
  for (let y = 0; y <= grid.rows - d; y++) {
    for (let x = 0; x <= grid.cols - w; x++) {
      if (canPlace(grid, bins, x, y, w, d)) return { x, y };
    }
  }
  return null;
}

const TONE: Record<string, string> = { ok: "ok", attribution: "accent", noncommercial: "warn", restricted: "bad" };
const CAT_LABEL: Record<Category, string> = {
  all: "All", bins: "Bins", baseplates: "Baseplates", holders: "Holders", tools: "Tools",
  organization: "Organization", generators: "Generators", misc: "Other",
};

export function LibraryModal({ onClose }: { onClose: () => void }) {
  const { grid, bins, addModel, addGeneratedBin } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [fitsOnly, setFitsOnly] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [full, setFull] = useState(false);

  const results = useMemo(
    () => searchCatalog(q, { category: cat, ...(fitsOnly ? { maxW: grid.cols, maxD: grid.rows } : {}) }),
    [q, cat, fitsOnly, grid.cols, grid.rows],
  );

  const place = (m: CatalogModel, generate: boolean) => {
    const w = m.footprint.widthU ?? (generate ? 2 : 1);
    const d = m.footprint.depthU ?? (generate ? 2 : 1);
    const spot = firstFreeSpot(grid, bins, w, d);
    if (!spot) {
      setFull(true);
      setAdded(null);
      return;
    }
    setFull(false);
    if (generate) {
      // Permissive generator -> a REAL editable bin from our own engine.
      addGeneratedBin(spot.x, spot.y, w, d, { title: m.title, url: m.sourceUrl, license: m.license });
    } else {
      const ref: ModelRef = {
        catalogId: m.id, title: m.title, author: m.author,
        source: m.source, sourceUrl: m.sourceUrl, license: m.license, thumbnail: m.thumbnail,
      };
      addModel(spot.x, spot.y, w, d, ref, m.footprint.heightU ?? 6);
    }
    setAdded(m.id);
  };

  return (
    <Sheet
      testid="library-modal"
      title="Community library"
      subtitle="Community Gridfinity models, indexed with their licenses. Files stay with their creators and download from the source."
      onClose={onClose}
      width={980}
      headerExtra={
        <div className="lib-controls">
          <div className="field" style={{ flex: 1, minWidth: 220, height: 38 }}>
            <Search size={16} style={{ color: "var(--ink-4)" }} />
            <input
              autoFocus
              type="search"
              data-testid="library-search"
              aria-label="Search models"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search screwdriver, battery, pliers…"
            />
          </div>
          <label className="lib-fits">
            Fits my grid
            <Switch label="Only show models that fit my grid" checked={fitsOnly} onChange={setFitsOnly} />
          </label>
          <div className="lib-cats" role="tablist" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={cat === c}
                data-testid={`cat-${c}`}
                className="lib-cat"
                onClick={() => setCat(c)}
              >
                {CAT_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          <span className="num" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            {results.length} model{results.length !== 1 ? "s" : ""}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            From the open{" "}
            <a href="https://github.com/shariqnaiyer/gridfinity-model-catalog" target="_blank" rel="noreferrer">gridfinity-model-catalog</a>.
            Always credit creators.
          </span>
        </>
      }
    >
      {full && (
        <div className="setup-msg bad" role="alert" style={{ marginBottom: 14 }}>
          <AlertCircle size={16} /> There's no free space on the grid for that footprint. Clear some cells and try again.
        </div>
      )}
      {results.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--ink-3)", padding: "56px 20px", fontSize: 14 }}>
          <p style={{ fontWeight: 600, color: "var(--ink)" }}>No models match.</p>
          <p style={{ marginTop: 4 }}>Try another search or category{fitsOnly ? ", or turn off “Fits my grid”" : ""}.</p>
        </div>
      ) : (
        <div className="lib-grid">
          {results.map((m) => (
            <ModelCard key={m.id} model={m} justAdded={added === m.id} onPlace={(gen) => place(m, gen)} />
          ))}
        </div>
      )}
    </Sheet>
  );
}

function ModelCard({ model: m, onPlace, justAdded }: { model: CatalogModel; onPlace: (generate: boolean) => void; justAdded: boolean }) {
  const lic = licenseInfo(m.license);
  const fp = m.footprint;
  const canGenerate = m.generator === "bin";
  const testid = canGenerate ? `generate-${m.id}` : `import-${m.id}`;
  return (
    <article className="lib-card">
      <div className="lib-thumb">
        {m.thumbnail ? (
          <img src={m.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <IsoBin generator={canGenerate} />
        )}
      </div>
      <div className="lib-card-body">
        <h3 className="lib-title">{m.title}</h3>
        <p className="lib-author">by {m.author}</p>
        <div className="lib-badges">
          <span className={`badge ${TONE[lic.tone]}`} title={lic.nonCommercial ? "Non-commercial license" : undefined}>
            {lic.tone === "ok" ? <ShieldCheck size={11} /> : lic.tone === "restricted" || lic.tone === "noncommercial" ? <AlertCircle size={11} /> : null}
            {lic.label}
          </span>
          <span className="badge num">
            {fp.widthU && fp.depthU ? `${fp.widthU}×${fp.depthU}${fp.heightU ? `×${fp.heightU}` : ""}` : m.parametric ? "Any size" : "Set size"}
          </span>
          {canGenerate && (
            <span className="badge ok" title="drawr generates this as a real, editable, watertight bin">
              <Sparkles size={11} /> Real geometry
            </span>
          )}
        </div>
        <div className="lib-actions">
          <button
            type="button"
            className={`btn ${justAdded ? "btn-secondary" : "btn-primary"}`}
            data-testid={testid}
            onClick={() => onPlace(canGenerate)}
            title={canGenerate ? "Generate a real bin you can edit and export" : "Reserve this model's footprint on your grid"}
            style={{ flex: 1 }}
          >
            {justAdded ? <><Check size={15} /> Added</> : canGenerate ? <><Sparkles size={14} /> Generate bin</> : <><Plus size={15} /> Add to grid</>}
          </button>
          <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" aria-label={`Open ${m.title} at the source`} title="Open the source page" style={{ width: 32, padding: 0 }}>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}

/** Drawn fallback for models without a thumbnail: an isometric bin. */
function IsoBin({ generator }: { generator: boolean }) {
  const face = generator ? "#38c493" : "#c9c9d1";
  const side = generator ? "#26a578" : "#b0b0ba";
  const top = generator ? "#7fe0bc" : "#e4e4ea";
  return (
    <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden>
      <polygon points="60,14 104,36 60,58 16,36" fill={top} />
      <polygon points="60,22 92,38 60,54 28,38" fill={side} opacity="0.55" />
      <polygon points="16,36 60,58 60,82 16,60" fill={face} />
      <polygon points="104,36 60,58 60,82 104,60" fill={side} />
    </svg>
  );
}
