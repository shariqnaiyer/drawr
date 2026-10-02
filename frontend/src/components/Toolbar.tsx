import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Undo2, Redo2, LibraryBig, ArrowDownToLine } from "lucide-react";
import { useStore } from "../store";
import { GRID_UNIT, type Step } from "../types";
import { Segmented, Wordmark } from "./ui";

const STEPS: { key: Step; label: string }[] = [
  { key: "setup", label: "Setup" },
  { key: "design", label: "Design" },
  { key: "export", label: "Export" },
];

export function Toolbar({ onExport, onOpenLibrary }: { onExport: () => void; onOpenLibrary: () => void }) {
  const { grid, view, setView, step, setStep, bins, undo, redo, past, future } = useStore();

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <Link to="/" aria-label="drawr home" style={{ textDecoration: "none", display: "flex" }}>
          <Wordmark />
        </Link>
        <nav className="crumbs" aria-label="Steps">
          {STEPS.map((s, i) => (
            <Fragment key={s.key}>
              {i > 0 && <span className="crumb-sep" aria-hidden><ChevronRight size={13} /></span>}
              <button
                type="button"
                className="crumb"
                data-testid={`step-${s.key}`}
                aria-current={s.key === step ? "step" : undefined}
                onClick={() => setStep(s.key)}
              >
                {s.label}
              </button>
            </Fragment>
          ))}
        </nav>
        <span className="doc-size num">
          {grid.cols * GRID_UNIT} × {grid.rows * GRID_UNIT} mm
        </span>
      </div>

      <Segmented
        label="View"
        value={view}
        onChange={setView}
        options={[
          { value: "2d", label: "2D", testid: "view-2d", title: "Top-down layout" },
          { value: "3d", label: "3D", testid: "view-3d", title: "3D preview" },
        ]}
      />

      <div className="toolbar-right">
        <button type="button" className="btn btn-icon" data-testid="tool-undo" aria-label="Undo"
          title="Undo (⌘Z)" onClick={undo} disabled={!past.length}>
          <Undo2 size={17} />
        </button>
        <button type="button" className="btn btn-icon" data-testid="tool-redo" aria-label="Redo"
          title="Redo (⇧⌘Z)" onClick={redo} disabled={!future.length}>
          <Redo2 size={17} />
        </button>
        <span className="toolbar-divider" aria-hidden />
        <button type="button" className="btn btn-secondary" data-testid="open-library" onClick={onOpenLibrary}
          aria-label="Browse community models" title="Browse community models">
          <LibraryBig size={15} />
          <span className="lib-label">Library</span>
        </button>
        <button type="button" className="btn btn-primary" data-testid="export-stl-btn" onClick={onExport}
          disabled={bins.length === 0} style={{ marginLeft: 6 }}>
          <ArrowDownToLine size={15} />
          Export
        </button>
      </div>
    </header>
  );
}
