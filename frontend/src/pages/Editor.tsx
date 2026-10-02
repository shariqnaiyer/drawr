import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Monitor } from "lucide-react";
import { useStore } from "../store";
import { Toolbar } from "../components/Toolbar";
import { Setup } from "../components/Setup";
import { Canvas2D } from "../components/Canvas2D";
import { Dock, ZoomControl, FilamentSwatches } from "../components/Dock";
import { Inspector } from "../components/Inspector";
import { Preview3D, Pip3D } from "../components/Preview3D";
import { ExportModal } from "../components/ExportModal";
import { LibraryModal } from "../components/LibraryModal";
import { Wordmark } from "../components/ui";
import { GRID_UNIT } from "../types";
import { maxBinU } from "../lib/fit";
import "../components/editor.css";

function StatusBar() {
  const { grid, bins, drawer } = useStore();
  const filled = bins.reduce((n, b) => n + b.w * b.d, 0);
  const cells = grid.cols * grid.rows;
  const ready = bins.length > 0;
  const maxU = maxBinU(drawer?.heightMm);
  const tooTall = maxU === null ? 0 : bins.filter((b) => b.heightU > maxU).length;
  return (
    <footer className="status" data-testid="status-bar">
      <span>Grid <b className="num">{grid.cols} × {grid.rows}</b></span>
      <span className="hide-md">Baseplate <b className="num">{grid.cols * GRID_UNIT} × {grid.rows * GRID_UNIT} mm</b></span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Filled <b className="num">{filled}/{cells}</b>
        <span className="status-meter" aria-hidden><i style={{ transform: `scaleX(${filled / cells})` }} /></span>
      </span>
      <span>Bins <b className="num" data-testid="bin-count">{bins.length}</b></span>
      <span className={`status-state${tooTall ? " warn" : ready ? " ok" : ""}`} data-testid="status-state">
        <i aria-hidden />
        {tooTall
          ? `${tooTall} bin${tooTall !== 1 ? "s" : ""} too tall for the drawer`
          : ready ? "Ready to export" : "Add a bin to export"}
      </span>
    </footer>
  );
}

export default function Editor() {
  const { step, view, selectedId, deleteBin, undo, redo, select, setTool, setStep } = useStore();
  const [showLibrary, setShowLibrary] = useState(false);
  const showExport = step === "export";

  useEffect(() => {
    document.title = step === "setup" ? "New drawer — drawr" : "drawr";
  }, [step]);

  // keyboard shortcuts (ignored while typing or while a sheet is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (showLibrary || showExport || step === "setup") return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && k === "y") {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteBin(selectedId);
      } else if (e.key === "Escape") {
        select(null);
      } else if (!mod && k === "v") {
        setTool("select");
      } else if (!mod && k === "b") {
        setTool("add");
      } else if (!mod && k === "h") {
        setTool("pan");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, deleteBin, undo, redo, select, setTool, showLibrary, showExport, step]);

  return (
    <div className="app">
      {step === "setup" ? (
        <Setup />
      ) : (
        <>
          <Toolbar onExport={() => setStep("export")} onOpenLibrary={() => setShowLibrary(true)} />
          <div className="workspace">
            <main className="stage-area" aria-label={view === "2d" ? "Layout canvas" : "3D preview"}>
              {view === "2d" ? (
                <>
                  <Canvas2D />
                  <Dock />
                  <ZoomControl />
                  <FilamentSwatches />
                  <Pip3D />
                </>
              ) : (
                <>
                  <Preview3D />
                  <FilamentSwatches />
                </>
              )}
            </main>
            <Inspector />
          </div>
          <StatusBar />
        </>
      )}

      {showExport && <ExportModal onClose={() => setStep("design")} />}
      {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}

      <div className="small-screen">
        <Wordmark size={20} />
        <Monitor size={40} strokeWidth={1.4} style={{ color: "var(--ink-4)", marginTop: 18 }} />
        <h1>Open drawr on a bigger screen.</h1>
        <p>The layout editor needs room to draw. Use an iPad, laptop, or desktop.</p>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 6 }}>Back to home</Link>
      </div>
    </div>
  );
}
