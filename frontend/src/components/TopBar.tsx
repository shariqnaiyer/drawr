import { Download, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../store";
import { GRID_UNIT } from "../types";
import type { Step } from "../types";

function BrandMark() {
  return (
    <div className="brand-mark">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} style={{ opacity: i === 4 ? 0.45 : 1 }} />
      ))}
    </div>
  );
}

const STEPS: { key: Step; n: string; label: string }[] = [
  { key: "setup", n: "01", label: "Setup" },
  { key: "design", n: "02", label: "Design" },
  { key: "export", n: "03", label: "Export" },
];

export function TopBar({ onExport }: { onExport: () => void }) {
  const { grid, view, setView, step, setStep, bins } = useStore();
  const order = STEPS.findIndex((s) => s.key === step);

  return (
    <div
      style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 14px",
        borderBottom: "1px solid var(--hairline)",
        background: "var(--panel)",
      }}
    >
      {/* brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Link to="/" title="Home" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit" }}>
          <BrandMark />
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            Gridfinity Studio
          </span>
        </Link>
        <span
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 24,
            padding: "0 9px",
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          {grid.cols}×{grid.rows}
        </span>
      </div>

      {/* step nav */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = i < order;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setStep(s.key)}
                data-testid={`step-${s.key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 30,
                  padding: "0 11px",
                  border: "none",
                  borderRadius: 8,
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--accent-ink)" : done ? "var(--muted)" : "#9097a0",
                }}
              >
                <span className="mono" style={{ fontSize: 11, fontWeight: active ? 600 : 500 }}>
                  {s.n}
                </span>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span style={{ width: 22, height: 1, background: "#d8dce0" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 30,
            padding: "0 10px",
            border: "1px solid var(--hairline)",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 500,
            color: "var(--muted)",
          }}
        >
          <Ruler size={14} style={{ opacity: 0.6 }} />
          {grid.cols * GRID_UNIT} × {grid.rows * GRID_UNIT} mm
        </span>

        {/* 2D / 3D toggle */}
        <div
          style={{
            display: "flex",
            background: "#eff1f4",
            border: "1px solid #e4e7ea",
            borderRadius: 8,
            padding: 2,
            gap: 2,
          }}
        >
          {(["2d", "3d"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              data-testid={`view-${v}`}
              style={{
                display: "flex",
                alignItems: "center",
                height: 24,
                padding: "0 11px",
                border: "none",
                borderRadius: 6,
                background: view === v ? "#fff" : "transparent",
                boxShadow: view === v ? "0 1px 2px rgba(0,0,0,.1)" : "none",
                fontSize: 12,
                fontWeight: view === v ? 600 : 500,
                color: view === v ? "var(--accent)" : "var(--muted)",
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        <button className="btn-primary" data-testid="export-stl-btn" onClick={onExport} disabled={bins.length === 0}>
          <Download size={16} />
          Export STL
        </button>
      </div>
    </div>
  );
}
