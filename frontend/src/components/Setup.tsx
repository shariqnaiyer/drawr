import { useEffect, useState } from "react";
import { Ruler, Grid3x3, ArrowRight, Check } from "lucide-react";
import { useStore } from "../store";
import { computeGrid, type GridComputeResult } from "../api";

type Mode = "dimensions" | "units";

export function Setup() {
  const { setGrid, setStep } = useStore();
  const [mode, setMode] = useState<Mode>("dimensions");
  const [widthMm, setWidthMm] = useState(300);
  const [depthMm, setDepthMm] = useState(220);
  const [cols, setCols] = useState(7);
  const [rows, setRows] = useState(5);
  const [result, setResult] = useState<GridComputeResult | null>(null);

  // recompute whenever inputs change (computation lives on the backend so the
  // UI and the CAD kernel can never disagree about how many units fit)
  useEffect(() => {
    const args =
      mode === "dimensions"
        ? { width_mm: widthMm, depth_mm: depthMm }
        : { cols, rows };
    computeGrid(mode, args)
      .then(setResult)
      .catch(() => setResult(null));
  }, [mode, widthMm, depthMm, cols, rows]);

  const generate = () => {
    if (!result) return;
    setGrid({ cols: result.cols, rows: result.rows });
    setStep("design");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--panel)" }}>
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>Gridfinity Studio</span>
        <span style={{ fontSize: 13, color: "var(--muted-2)", fontWeight: 500 }}>Step 1 of 3</span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 64px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 720 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Set up your grid
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 7 }}>
              Enter your drawer's inner size, or pick how many units — we compute the rest.
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
            {/* By dimensions */}
            <ModeCard
              active={mode === "dimensions"}
              onPick={() => setMode("dimensions")}
              icon={<Ruler size={11} />}
              title="By dimensions"
              subtitle="Inner drawer size"
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <NumField label="Width" value={widthMm} unit="mm" onChange={setWidthMm} />
                <span style={{ height: 42, display: "flex", alignItems: "center", color: "#b7bdc4" }}>×</span>
                <NumField label="Depth" value={depthMm} unit="mm" onChange={setDepthMm} />
              </div>
            </ModeCard>

            {/* By unit count */}
            <ModeCard
              testid="mode-units"
              active={mode === "units"}
              onPick={() => setMode("units")}
              icon={<Grid3x3 size={11} />}
              title="By unit count"
              subtitle="Number of 42 mm units"
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <NumField label="Columns" value={cols} onChange={(v) => setCols(Math.max(1, v))} />
                <span style={{ height: 42, display: "flex", alignItems: "center", color: "#b7bdc4" }}>×</span>
                <NumField label="Rows" value={rows} onChange={(v) => setRows(Math.max(1, v))} />
              </div>
            </ModeCard>
          </div>

          {/* computed result */}
          <div
            style={{
              marginTop: 18,
              borderRadius: 12,
              border: "1px solid var(--hairline)",
              background: "var(--surface)",
              padding: 18,
            }}
          >
            <div className="section-label" style={{ marginBottom: 10 }}>
              Computed result
            </div>
            {result && (
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div className="mono" style={{ fontSize: 26, fontWeight: 600, color: "var(--ink)" }}>
                  {result.cols} × {result.rows}
                  <span style={{ fontSize: 13, color: "var(--muted-2)", marginLeft: 8 }}>units fit</span>
                </div>
                <div style={{ height: 32, width: 1, background: "var(--hairline)" }} />
                <div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>
                    {result.plate_width_mm} × {result.plate_depth_mm} mm baseplate
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                    Margin {result.margin_x_mm} mm sides · {result.margin_y_mm} mm front/back
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            data-testid="generate-grid"
            onClick={generate}
            disabled={!result}
            style={{ marginTop: 22, height: 44, width: "100%", justifyContent: "center", fontSize: 14 }}
          >
            Generate grid
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onPick,
  icon,
  title,
  subtitle,
  children,
  testid,
}: {
  active: boolean;
  onPick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  testid?: string;
}) {
  return (
    <div
      onClick={onPick}
      data-testid={testid}
      style={{
        flex: 1,
        border: active ? "1.5px solid var(--accent)" : "1.5px solid var(--hairline)",
        borderRadius: 12,
        padding: 18,
        cursor: "pointer",
        position: "relative",
        background: active ? "linear-gradient(180deg,var(--accent-soft),#fff 60%)" : "#fff",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            top: -9,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 18,
            padding: "0 8px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 5,
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {icon}
          SOURCE
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
        {!active && icon}
        {title}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted-2)", marginBottom: 14 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function NumField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 5 }}>{label}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 42,
          border: "1px solid #d8dce0",
          borderRadius: 9,
          background: "#fff",
          padding: "0 12px",
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mono"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 18,
            fontWeight: 500,
            color: "var(--ink)",
            background: "transparent",
            width: "100%",
          }}
        />
        {unit && (
          <span className="mono" style={{ fontSize: 12, color: "#9097a0" }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// re-exported icon for App's check usage
export { Check };
