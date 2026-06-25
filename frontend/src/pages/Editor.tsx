import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useStore } from "../store";
import { TopBar } from "../components/TopBar";
import { Setup } from "../components/Setup";
import { LeftRail } from "../components/LeftRail";
import { Canvas2D } from "../components/Canvas2D";
import { Palette } from "../components/Palette";
import { Inspector } from "../components/Inspector";
import { Preview3D, Pip3D } from "../components/Preview3D";
import { ExportModal } from "../components/ExportModal";

function ZoomControl() {
  const { zoom, setZoom } = useStore();
  return (
    <div
      data-testid="zoom-control"
      style={{
        position: "absolute",
        bottom: 14,
        left: 14,
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: 30,
        padding: 2,
        background: "rgba(26,30,37,.82)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 8,
        backdropFilter: "blur(6px)",
        zIndex: 9,
      }}
    >
      <button aria-label="Zoom out" onClick={() => setZoom(zoom - 0.1)} style={zBtn}><Minus size={15} /></button>
      <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: "#c8ced5", minWidth: 38, textAlign: "center" }}>
        {Math.round(zoom * 100)}%
      </span>
      <button aria-label="Zoom in" onClick={() => setZoom(zoom + 0.1)} style={zBtn}><Plus size={15} /></button>
    </div>
  );
}
const zBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26,
  borderRadius: 6, color: "#9aa3ad", background: "transparent", border: "none",
};

function StatusBar() {
  const { grid, bins } = useStore();
  const filled = bins.reduce((n, b) => n + b.w * b.d, 0);
  const cells = grid.cols * grid.rows;
  return (
    <div
      className="mono"
      data-testid="status-bar"
      style={{
        height: 30,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 14px",
        borderTop: "1px solid var(--hairline)",
        background: "var(--surface)",
        fontSize: 11,
        color: "var(--muted)",
      }}
    >
      <Stat label="grid">{grid.cols} × {grid.rows}</Stat>
      <Stat label="filled">{filled} / {cells}</Stat>
      <Stat label="bins"><span data-testid="bin-count">{bins.length}</span></Stat>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--valid)" }} />
        Valid layout · ready to export
      </span>
    </div>
  );
}
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "#9097a0" }}>{label}</span>
      {children}
    </span>
  );
}

export default function Editor() {
  const { step, view, selectedId, deleteBin, undo, redo, select, setTool } = useStore();
  const [showExport, setShowExport] = useState(false);

  // keyboard shortcuts (ignored while typing in an input)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteBin(selectedId);
      } else if (e.key === "Escape") {
        select(null);
      } else if (e.key === "v" || e.key === "V") {
        setTool("select");
      } else if (e.key === "b" || e.key === "B") {
        setTool("add");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, deleteBin, undo, redo, select, setTool]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--panel)" }}>
      {step !== "setup" && <TopBar onExport={() => setShowExport(true)} />}

      {step === "setup" ? (
        <Setup />
      ) : (
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <LeftRail />
          {view === "2d" ? (
            <div style={{ flex: 1, position: "relative", display: "flex", minWidth: 0 }}>
              <Canvas2D />
              <Palette />
              <ZoomControl />
              <Pip3D />
            </div>
          ) : (
            <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
              <Preview3D />
            </div>
          )}
          <Inspector />
        </div>
      )}

      {step !== "setup" && <StatusBar />}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
