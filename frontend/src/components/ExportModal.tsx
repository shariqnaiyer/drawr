import { useMemo, useState } from "react";
import { Download, X, Loader2, Package } from "lucide-react";
import { useStore } from "../store";
import { exportZip } from "../api";
import type { Bin } from "../types";

// Group bins into unique parts (same footprint/height/features) with a count.
function uniqueParts(bins: Bin[]) {
  const map = new Map<string, { sample: Bin; qty: number; key: string }>();
  for (const b of bins) {
    const key = `${b.w}×${b.d} · ${b.heightU}U${b.label ? " · label" : ""}${b.scoop ? " · scoop" : ""}${b.magnetHoles ? " · magnets" : ""}${b.screwHoles ? " · screws" : ""}`;
    const e = map.get(key);
    if (e) e.qty++;
    else map.set(key, { sample: b, qty: 1, key });
  }
  return [...map.values()];
}

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { grid, bins } = useStore();
  const [includeBaseplate, setIncludeBaseplate] = useState(true);
  const [busy, setBusy] = useState(false);
  // Generated bins become STLs; imported community models are credited only.
  const realBins = useMemo(() => bins.filter((b) => b.kind !== "model"), [bins]);
  const modelItems = useMemo(() => bins.filter((b) => b.kind === "model" && b.model), [bins]);
  const parts = useMemo(() => uniqueParts(realBins), [realBins]);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await exportZip("Gridfinity Design", grid, bins, includeBaseplate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gridfinity-design.zip";
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (e) {
      alert("Export failed: " + e);
    } finally {
      setBusy(false);
    }
  };

  const total = (includeBaseplate ? 1 : 0) + parts.length + (modelItems.length ? 1 : 0);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,18,22,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 560, maxHeight: "82vh", background: "var(--panel)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}
      >
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Export STL files</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
              {includeBaseplate ? "Baseplate + " : ""}{parts.length} unique part{parts.length !== 1 ? "s" : ""}, ready to slice & print.
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, padding: 0, justifyContent: "center" }}><X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "8px 20px" }}>
          {/* table header */}
          <div style={{ display: "flex", padding: "8px 4px", fontSize: 11, fontWeight: 600, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid var(--hairline-2)" }}>
            <span style={{ flex: 1 }}>Part</span>
            <span style={{ width: 50, textAlign: "center" }}>Qty</span>
            <span style={{ width: 70, textAlign: "right" }}>Format</span>
          </div>

          {includeBaseplate && (
            <Row name={`Baseplate ${grid.cols}×${grid.rows}`} qty={1} />
          )}
          {parts.map((p) => (
            <Row key={p.key} name={p.key} qty={p.qty} />
          ))}
          {parts.length === 0 && !includeBaseplate && modelItems.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted-2)", fontSize: 13 }}>Nothing to export.</div>
          )}

          {/* imported community models — credited, downloaded from source */}
          {modelItems.length > 0 && (
            <div style={{ marginTop: 14 }} data-testid="export-credits">
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-2)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>
                Community models · credited in CREDITS.md
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                Not included in the ZIP — download each from its source and follow its license.
              </div>
              {modelItems.map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", borderBottom: "1px solid var(--hairline-2)", fontSize: 13 }}>
                  <Package size={15} style={{ color: "var(--muted-2)" }} />
                  <span style={{ flex: 1 }}>{b.model!.title}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{b.model!.license}</span>
                  <a href={b.model!.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>source ↗</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3a4047", cursor: "pointer" }}>
            <input type="checkbox" checked={includeBaseplate} onChange={(e) => setIncludeBaseplate(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
            Include baseplate
          </label>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted-2)" }} className="mono">{total} file{total !== 1 ? "s" : ""}</span>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={download} className="btn-primary" data-testid="export-download" disabled={busy || total === 0}>
            {busy ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            {busy ? "Building…" : "Download ZIP"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ name, qty }: { name: string; qty: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "11px 4px", borderBottom: "1px solid var(--hairline-2)", fontSize: 13 }}>
      <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 9 }}>
        <Package size={15} style={{ color: "var(--muted-2)" }} />
        {name}
      </span>
      <span className="mono" style={{ width: 50, textAlign: "center", color: "var(--muted)" }}>×{qty}</span>
      <span className="mono" style={{ width: 70, textAlign: "right", color: "var(--accent)", fontWeight: 600 }}>STL</span>
    </div>
  );
}
