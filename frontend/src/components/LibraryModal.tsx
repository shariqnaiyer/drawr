import { useMemo, useState } from "react";
import { X, Search, ExternalLink, Plus, Package, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { useStore, canPlace } from "../store";
import { searchCatalog, licenseInfo, CATEGORIES, type Category, type CatalogModel } from "../catalog";
import type { Grid, Bin, ModelRef } from "../types";

// First free top-left cell that fits a w x d footprint, or null if none.
function firstFreeSpot(grid: Grid, bins: Bin[], w: number, d: number) {
  for (let y = 0; y <= grid.rows - d; y++) {
    for (let x = 0; x <= grid.cols - w; x++) {
      if (canPlace(grid, bins, x, y, w, d)) return { x, y };
    }
  }
  return null;
}

const TONE: Record<string, { bg: string; fg: string; bd: string }> = {
  ok: { bg: "#e6f3ec", fg: "#1f7a4d", bd: "#bfe3cf" },
  attribution: { bg: "var(--accent-soft)", fg: "var(--accent-ink)", bd: "#cfe0fb" },
  noncommercial: { bg: "#fdf1dd", fg: "#9a6a16", bd: "#f0dcae" },
  restricted: { bg: "#fbeaea", fg: "#b4322f", bd: "#f1cdcd" },
};

export function LibraryModal({ onClose }: { onClose: () => void }) {
  const { grid, bins, addModel, addGeneratedBin } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [fitsOnly, setFitsOnly] = useState(false);
  const [imported, setImported] = useState<string | null>(null);

  const results = useMemo(
    () => searchCatalog(q, { category: cat, ...(fitsOnly ? { maxW: grid.cols, maxD: grid.rows } : {}) }),
    [q, cat, fitsOnly, grid.cols, grid.rows],
  );

  const doImport = (m: CatalogModel) => {
    const w = m.footprint.widthU ?? 1;
    const d = m.footprint.depthU ?? 1;
    const spot = firstFreeSpot(grid, bins, w, d);
    if (!spot) {
      setImported("__full__");
      return;
    }
    const ref: ModelRef = {
      catalogId: m.id, title: m.title, author: m.author,
      source: m.source, sourceUrl: m.sourceUrl, license: m.license, thumbnail: m.thumbnail,
    };
    addModel(spot.x, spot.y, w, d, ref, m.footprint.heightU ?? 6);
    setImported(m.id);
  };

  // Permissive generator -> generate a REAL editable bin with our own engine.
  const doGenerate = (m: CatalogModel) => {
    const w = m.footprint.widthU ?? 2;
    const d = m.footprint.depthU ?? 2;
    const spot = firstFreeSpot(grid, bins, w, d);
    if (!spot) {
      setImported("__full__");
      return;
    }
    addGeneratedBin(spot.x, spot.y, w, d, { title: m.title, url: m.sourceUrl, license: m.license });
    setImported(m.id);
  };

  return (
    <div
      onClick={onClose}
      data-testid="library-modal"
      style={{ position: "fixed", inset: 0, background: "rgba(15,18,22,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 880, maxWidth: "94vw", height: "82vh", background: "var(--panel)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}
      >
        {/* header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Community model library</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                Search community Gridfinity models and drop them onto your grid. Files are downloaded from the source — licenses apply.
              </div>
            </div>
            <button aria-label="Close" onClick={onClose} className="btn-ghost" style={{ width: 32, padding: 0, justifyContent: "center" }}><X size={16} /></button>
          </div>

          {/* search + filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220, height: 38, padding: "0 12px", border: "1px solid var(--hairline)", borderRadius: 9, background: "var(--surface)" }}>
              <Search size={16} style={{ color: "var(--muted-2)" }} />
              <input
                autoFocus
                data-testid="library-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search e.g. screwdriver, battery, label…"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={fitsOnly} onChange={(e) => setFitsOnly(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              Fits my grid
            </label>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                data-testid={`cat-${c}`}
                onClick={() => setCat(c)}
                style={{
                  height: 26, padding: "0 11px", borderRadius: 7, fontSize: 12, fontWeight: 500, textTransform: "capitalize",
                  border: `1px solid ${cat === c ? "var(--accent)" : "var(--hairline)"}`,
                  background: cat === c ? "var(--accent-soft)" : "#fff",
                  color: cat === c ? "var(--accent-ink)" : "var(--muted)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* results */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {imported === "__full__" && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fbeaea", color: "#b4322f", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} /> No free space on the grid for that footprint.
            </div>
          )}
          {results.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--muted-2)", padding: 40, fontSize: 14 }}>
              No models match. Try a different search or category.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
              {results.map((m) => (
                <ModelCard key={m.id} model={m} justImported={imported === m.id}
                  onImport={() => doImport(m)} onGenerate={() => doGenerate(m)} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "10px 20px", borderTop: "1px solid var(--hairline)", fontSize: 12, color: "var(--muted-2)", display: "flex", justifyContent: "space-between" }}>
          <span>{results.length} model{results.length !== 1 ? "s" : ""}</span>
          <span>Indexed from the open <span style={{ color: "var(--accent)" }}>gridfinity-model-catalog</span> · always attribute creators</span>
        </div>
      </div>
    </div>
  );
}

function ModelCard({ model: m, onImport, onGenerate, justImported }: { model: CatalogModel; onImport: () => void; onGenerate: () => void; justImported: boolean }) {
  const lic = licenseInfo(m.license);
  const tone = TONE[lic.tone];
  const fp = m.footprint;
  const canGenerate = m.generator === "bin";
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div style={{ height: 120, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--hairline-2)" }}>
        {m.thumbnail ? (
          <img src={m.thumbnail} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Package size={34} style={{ color: "#c2c8ce" }} />
        )}
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{m.title}</div>
          <div style={{ fontSize: 12, color: "var(--muted-2)", marginTop: 2 }}>by {m.author}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span title={lic.nonCommercial ? "Non-commercial license" : undefined}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: tone.bg, color: tone.fg, border: `1px solid ${tone.bd}` }}>
            {lic.tone === "ok" ? <ShieldCheck size={11} /> : lic.tone === "restricted" || lic.tone === "noncommercial" ? <AlertTriangle size={11} /> : null}
            {lic.label}
          </span>
          {fp.widthU && fp.depthU ? (
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--hairline)" }}>
              {fp.widthU}×{fp.depthU}{fp.heightU ? `×${fp.heightU}` : ""}
            </span>
          ) : (
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "var(--surface)", color: "var(--muted-2)", border: "1px solid var(--hairline)" }}>
              {m.parametric ? "any size" : "set size"}
            </span>
          )}
          {canGenerate && (
            <span title="We generate this as a real, editable, watertight bin"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "#e6f3ec", color: "#1f7a4d", border: "1px solid #bfe3cf" }}>
              <Sparkles size={11} /> real geometry
            </span>
          )}
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
          {canGenerate ? (
            <button
              onClick={onGenerate}
              data-testid={`generate-${m.id}`}
              className="btn-primary"
              title="Generate a real bin you can edit and export"
              style={{ flex: 1, height: 32, justifyContent: "center", fontSize: 13 }}
            >
              {justImported ? "Added ✓" : <><Sparkles size={15} /> Generate bin</>}
            </button>
          ) : (
            <button
              onClick={onImport}
              data-testid={`import-${m.id}`}
              className="btn-primary"
              style={{ flex: 1, height: 32, justifyContent: "center", fontSize: 13 }}
            >
              {justImported ? "Added ✓" : <><Plus size={15} /> Import</>}
            </button>
          )}
          <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="btn-ghost" title="Open source page" style={{ width: 36, padding: 0, justifyContent: "center" }}>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
