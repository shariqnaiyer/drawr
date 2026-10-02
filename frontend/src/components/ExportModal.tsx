import { useMemo, useState } from "react";
import { ArrowDownToLine, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useStore } from "../store";
import { exportZip } from "../api";
import type { Bin } from "../types";
import { HEIGHT_UNIT } from "../types";
import { filament as getFilament } from "../lib/filament";
import { FootprintGlyph, Sheet, Switch } from "./ui";
import { maxBinU } from "../lib/fit";

interface Part {
  key: string;
  title: string;
  sample: Bin;
  qty: number;
  tags: string[];
}

// Group bins into unique parts (same footprint, height, dividers and features)
// with a count — mirrors the backend's de-duplication.
function uniqueParts(bins: Bin[]): Part[] {
  const map = new Map<string, Part>();
  for (const b of bins) {
    const tags = b.solid
      ? [b.magnetHoles && "Magnets", b.screwHoles && "Screws"]
      : [
          (b.comp.cols > 1 || b.comp.rows > 1) && `${b.comp.cols}×${b.comp.rows} dividers`,
          b.label && "Label",
          b.scoop && "Scoop",
          b.magnetHoles && "Magnets",
          b.screwHoles && "Screws",
        ];
    const clean = tags.filter(Boolean) as string[];
    const title = `${b.solid ? "Lid" : "Bin"} ${b.w}×${b.d}`;
    const key = `${title}|${b.heightU}|${clean.join(",")}`;
    const e = map.get(key);
    if (e) e.qty++;
    else map.set(key, { key, title, sample: b, qty: 1, tags: clean });
  }
  return [...map.values()];
}

export function ExportModal({ onClose }: { onClose: () => void }) {
  const { grid, bins, filament, drawer } = useStore();
  const maxU = maxBinU(drawer?.heightMm);
  const fil = getFilament(filament);
  const [includeBaseplate, setIncludeBaseplate] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Generated bins become STLs; imported community models are credited only.
  const realBins = useMemo(() => bins.filter((b) => b.kind !== "model"), [bins]);
  const modelItems = useMemo(() => bins.filter((b) => b.kind === "model" && b.model), [bins]);
  const parts = useMemo(() => uniqueParts(realBins), [realBins]);

  const total = (includeBaseplate ? 1 : 0) + parts.length + (modelItems.length ? 1 : 0);
  const printCount = (includeBaseplate ? 1 : 0) + realBins.length;

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await exportZip("drawr layout", grid, bins, includeBaseplate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drawr-${grid.cols}x${grid.rows}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      setError("The export didn't finish. The geometry service may be waking up, so wait a few seconds and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      title="Export STL files"
      subtitle={
        <>
          <span className="num">{total}</span> file{total !== 1 ? "s" : ""} ·{" "}
          <span className="num">{printCount}</span> part{printCount !== 1 ? "s" : ""} to print. Each STL is watertight and ready to slice.
        </>
      }
      onClose={onClose}
      width={600}
      footer={
        <>
          <span className="num" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
            {total} file{total !== 1 ? "s" : ""} in ZIP
          </span>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" data-testid="export-download" onClick={download} disabled={busy || total === 0}>
            {busy ? <Loader2 size={15} className="spin" /> : <ArrowDownToLine size={15} />}
            {busy ? "Building parts…" : "Download ZIP"}
          </button>
        </>
      }
    >
      {error && (
        <div className="setup-msg bad" role="alert" style={{ marginBottom: 14 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {maxU !== null && bins.some((b) => b.heightU > maxU) && (
        <div className="setup-msg warn" role="status" style={{ marginBottom: 14 }} data-testid="export-too-tall">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          Some bins are taller than {maxU} U and won't fit under your drawer. You can still export them.
        </div>
      )}

      <div className="xp-table" role="table" aria-label="Parts">
        <div className="xp-row xp-th" role="row">
          <span role="columnheader">Part</span>
          <span role="columnheader" style={{ textAlign: "right" }}>Qty</span>
          <span role="columnheader" style={{ textAlign: "right" }}>File</span>
        </div>

        <div className={`xp-row${includeBaseplate ? "" : " off"}`} role="row">
          <span className="xp-part" role="cell">
            <span className="xp-glyph"><FootprintGlyph w={Math.min(grid.cols, 5)} d={Math.min(grid.rows, 4)} cell={4} gap={1} color="var(--ink-4)" /></span>
            <span>
              <span className="xp-name">Baseplate {grid.cols}×{grid.rows}</span>
              <span className="xp-meta num">{grid.cols * 42} × {grid.rows * 42} mm</span>
            </span>
          </span>
          <span className="xp-qty num" role="cell">
            <Switch label="Include baseplate" checked={includeBaseplate} onChange={setIncludeBaseplate} testid="include-baseplate" />
          </span>
          <span className="xp-fmt num" role="cell">{includeBaseplate ? "STL" : "—"}</span>
        </div>

        {parts.map((p) => (
          <div className="xp-row" role="row" key={p.key}>
            <span className="xp-part" role="cell">
              <span className="xp-glyph"><FootprintGlyph w={p.sample.w} d={p.sample.d} cell={p.sample.w > 3 || p.sample.d > 3 ? 4 : 6} gap={1} color={fil.face} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="xp-name">{p.title}</span>
                <span className="xp-meta">
                  <span className="num">{p.sample.heightU} U · {p.sample.heightU * HEIGHT_UNIT} mm</span>
                  {p.tags.map((t) => <span key={t} className="badge">{t}</span>)}
                </span>
              </span>
            </span>
            <span className="xp-qty num" role="cell">×{p.qty}</span>
            <span className="xp-fmt num" role="cell">STL</span>
          </div>
        ))}

        {parts.length === 0 && (
          <p style={{ padding: "18px 4px", color: "var(--ink-3)", fontSize: 13 }}>
            No generated bins yet. Draw some on the grid to export them.
          </p>
        )}
      </div>

      {modelItems.length > 0 && (
        <section style={{ marginTop: 22 }} data-testid="export-credits">
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>Community models</h3>
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", margin: "3px 0 8px" }}>
            Credited in CREDITS.md but not included in the ZIP. Download each one from its source and follow its license.
          </p>
          <div className="xp-table">
            {modelItems.map((b) => (
              <div key={b.id} className="xp-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
                <span className="xp-part">
                  <span className="xp-name" style={{ whiteSpace: "normal" }}>{b.model!.title}</span>
                </span>
                <span className="badge num">{b.model!.license}</span>
                <a href={b.model!.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-plain" style={{ height: 28 }}>
                  Source <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </Sheet>
  );
}
