import { MousePointer2, Hand, Trash2, Minus, Plus, Scan, PenLine } from "lucide-react";
import { useStore } from "../store";
import type { Tool } from "../types";
import { FILAMENTS } from "../lib/filament";

// Footprint presets. Pick one to start drawing; drag on the grid for any size.
const FOOTPRINTS: { w: number; d: number }[] = [
  { w: 1, d: 1 },
  { w: 2, d: 1 },
  { w: 2, d: 2 },
  { w: 3, d: 1 },
  { w: 3, d: 2 },
  { w: 4, d: 2 },
];

const TOOLS: { tool: Tool; label: string; key: string; icon: React.ReactNode }[] = [
  { tool: "select", label: "Select", key: "V", icon: <MousePointer2 size={17} /> },
  { tool: "add", label: "Draw", key: "B", icon: <PenLine size={17} /> },
  { tool: "pan", label: "Pan", key: "H", icon: <Hand size={17} /> },
];

/** The floating tool dock: tools, footprint presets, delete. */
export function Dock() {
  const { tool, setTool, pendingFootprint, setPendingFootprint, selectedId, deleteBin } = useStore();
  return (
    <div className="float dock" role="toolbar" aria-label="Tools">
      {TOOLS.map((t) => (
        <button
          key={t.tool}
          type="button"
          className="dock-btn"
          data-testid={`tool-${t.tool}`}
          aria-pressed={tool === t.tool}
          title={`${t.label} (${t.key})`}
          onClick={() => setTool(t.tool)}
        >
          {t.icon}
          <span className="lbl">{t.label}</span>
        </button>
      ))}
      <span className="dock-sep" aria-hidden />
      {FOOTPRINTS.map((fp) => {
        const active = tool === "add" && pendingFootprint.w === fp.w && pendingFootprint.d === fp.d;
        return (
          <button
            key={`${fp.w}x${fp.d}`}
            type="button"
            className="dock-btn"
            data-testid={`fp-${fp.w}x${fp.d}`}
            aria-pressed={active}
            aria-label={`Draw a ${fp.w} by ${fp.d} bin`}
            title={`${fp.w} × ${fp.d} bin`}
            onClick={() => setPendingFootprint(fp.w, fp.d)}
          >
            <span className="fp-glyph" style={{ gridTemplateColumns: `repeat(${fp.w}, 6px)` }} aria-hidden>
              {Array.from({ length: fp.w * fp.d }).map((_, i) => <span key={i} />)}
            </span>
            <span className="lbl num">{fp.w}×{fp.d}</span>
          </button>
        );
      })}
      <span className="dock-sep" aria-hidden />
      <button
        type="button"
        className="dock-btn"
        data-testid="tool-delete"
        title="Delete selected (⌫)"
        disabled={!selectedId}
        onClick={() => selectedId && deleteBin(selectedId)}
      >
        <Trash2 size={17} />
        <span className="lbl">Delete</span>
      </button>
    </div>
  );
}

export function ZoomControl() {
  const { zoom, setZoom } = useStore();
  return (
    <div className="float zoom" data-testid="zoom-control">
      <button type="button" aria-label="Zoom out" onClick={() => setZoom(zoom - 0.1)}><Minus size={15} /></button>
      <button type="button" className="pct num" aria-label="Reset zoom to 100%" title="Reset to 100%" onClick={() => setZoom(1)}>
        {Math.round(zoom * 100)}%
      </button>
      <button type="button" aria-label="Zoom in" onClick={() => setZoom(zoom + 0.1)}><Plus size={15} /></button>
      <button type="button" aria-label="Zoom to fit" title="Zoom to fit" onClick={() => window.dispatchEvent(new Event("drawr:fit"))}>
        <Scan size={15} />
      </button>
    </div>
  );
}

/** Preview color picker — affects the 2D and 3D preview only, never the export. */
export function FilamentSwatches() {
  const { filament, setFilament } = useStore();
  const current = FILAMENTS.find((f) => f.id === filament)!;
  return (
    <div className="float swatches" role="group" aria-label="Preview color">
      <span className="swatches-label">{current.name}</span>
      {FILAMENTS.map((f) => (
        <button
          key={f.id}
          type="button"
          className="swatch"
          aria-pressed={f.id === filament}
          aria-label={`Preview in ${f.name}`}
          title={f.name}
          data-testid={`filament-${f.id}`}
          style={{ background: `linear-gradient(145deg, ${f.face} 45%, ${f.side})` }}
          onClick={() => setFilament(f.id)}
        />
      ))}
    </div>
  );
}
