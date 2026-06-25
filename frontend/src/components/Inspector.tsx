import { Copy, Trash2, Tag, Utensils, Magnet, CircleDot, MousePointerClick } from "lucide-react";
import { useStore } from "../store";
import { GRID_UNIT, HEIGHT_UNIT } from "../types";

const HEIGHT_PRESETS = [3, 6, 12];

export function Inspector() {
  const { bins, selectedId, updateBin, resizeBin, deleteBin, duplicateBin, applyToAll } = useStore();
  const bin = bins.find((b) => b.id === selectedId) || null;

  if (!bin) {
    return (
      <Panel>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--muted-2)", padding: 24, textAlign: "center" }}>
          <MousePointerClick size={28} style={{ opacity: 0.5 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>No bin selected</div>
          <div style={{ fontSize: 12 }}>Pick a footprint from the palette and click the grid to place a bin, then select it to edit.</div>
        </div>
      </Panel>
    );
  }

  const sameSize = bins.filter(
    (b) => b.w === bin.w && b.d === bin.d && b.heightU === bin.heightU,
  ).length;

  return (
    <Panel>
      {/* header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--hairline-2)", display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,7px)", gridTemplateRows: "repeat(2,7px)", gap: 2, padding: 5, background: "var(--accent-soft)", borderRadius: 7 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{ width: 7, height: 7, background: "var(--accent)", borderRadius: 1.5 }} />
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bin · {bin.w}×{bin.d}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted-2)" }}>
              {bin.w * GRID_UNIT - 0.5} × {bin.d * GRID_UNIT - 0.5} mm footprint
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <IconBtn testid="inspector-duplicate" onClick={() => duplicateBin(bin.id)}><Copy size={15} /></IconBtn>
            <IconBtn testid="inspector-delete" danger onClick={() => deleteBin(bin.id)}><Trash2 size={15} /></IconBtn>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
        {/* footprint */}
        <Section title="Footprint" right={`${bin.w * GRID_UNIT - 0.5} × ${bin.d * GRID_UNIT - 0.5} mm`}>
          <div style={{ display: "flex", gap: 8 }}>
            <Stepper testid="footprint-w" label="Width (U)" value={bin.w} onChange={(v) => resizeBin(bin.id, v, bin.d)} />
            <Stepper testid="footprint-d" label="Depth (U)" value={bin.d} onChange={(v) => resizeBin(bin.id, bin.w, v)} />
          </div>
        </Section>

        {/* height */}
        <Section title="Height" right={`${bin.heightU * HEIGHT_UNIT} mm · ${bin.heightU} U`}>
          <div style={{ display: "flex", gap: 5 }}>
            {HEIGHT_PRESETS.map((u) => (
              <HeightChip key={u} active={bin.heightU === u} onClick={() => updateBin(bin.id, { heightU: u })}>
                {u}U
              </HeightChip>
            ))}
            <HeightChip active={!HEIGHT_PRESETS.includes(bin.heightU)} onClick={() => {}}>
              Custom
            </HeightChip>
          </div>
          <input
            type="range" min={2} max={20} value={bin.heightU} data-testid="height-slider"
            onChange={(e) => updateBin(bin.id, { heightU: Number(e.target.value) })}
            style={{ width: "100%", marginTop: 12, accentColor: "var(--accent)" }}
          />
        </Section>

        {/* compartments */}
        <Section title="Compartments" right={`${bin.comp.cols} × ${bin.comp.rows}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 3, width: 96, height: 40, padding: 4, background: "var(--surface)", border: "1px solid #e8ebee", borderRadius: 7 }}>
              {Array.from({ length: bin.comp.cols }).map((_, c) => (
                <div key={c} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                  {Array.from({ length: bin.comp.rows }).map((_, r) => (
                    <div key={r} style={{ flex: 1, background: "#fff", border: "1px solid #dde1e5", borderRadius: 3 }} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", gap: 6 }}>
              <Stepper testid="comp-cols" label="Cols" value={bin.comp.cols} min={1}
                onChange={(v) => updateBin(bin.id, { comp: { ...bin.comp, cols: v } })} />
              <Stepper testid="comp-rows" label="Rows" value={bin.comp.rows} min={1}
                onChange={(v) => updateBin(bin.id, { comp: { ...bin.comp, rows: v } })} />
            </div>
          </div>
        </Section>

        {/* features */}
        <div style={{ padding: "13px 16px" }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Features</div>
          <Toggle testid="toggle-label" icon={<Tag size={16} />} label="Label tab" value={bin.label} onChange={(v) => updateBin(bin.id, { label: v })} />
          <Toggle testid="toggle-scoop" icon={<Utensils size={16} />} label="Scoop ramp" value={bin.scoop} onChange={(v) => updateBin(bin.id, { scoop: v })} />
          <Toggle testid="toggle-magnet" icon={<Magnet size={16} />} label="Magnet holes" value={bin.magnetHoles} onChange={(v) => updateBin(bin.id, { magnetHoles: v })} />
          <Toggle testid="toggle-screw" icon={<CircleDot size={16} />} label="Screw holes" value={bin.screwHoles} onChange={(v) => updateBin(bin.id, { screwHoles: v })} />
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "11px 16px", borderTop: "1px solid var(--hairline-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#9097a0" }}>{sameSize} bin{sameSize !== 1 ? "s" : ""} share this size</span>
        <span data-testid="apply-to-all" onClick={() => applyToAll(bin.id)} style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>
          Apply to all
        </span>
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 304, flexShrink: 0, background: "var(--panel)", borderLeft: "1px solid var(--hairline)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {children}
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "13px 16px", borderBottom: "1px solid #f1f3f5" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span className="section-label">{title}</span>
        {right && <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{right}</span>}
      </div>
      {children}
    </div>
  );
}

function Stepper({ label, value, onChange, min = 1, testid }: { label: string; value: number; onChange: (v: number) => void; min?: number; testid?: string }) {
  return (
    <div style={{ flex: 1 }} data-testid={testid}>
      <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid #e1e4e8", borderRadius: 7, overflow: "hidden", height: 30 }}>
        <button aria-label={`${label} decrease`} data-testid={testid ? `${testid}-dec` : undefined} onClick={() => onChange(Math.max(min, value - 1))} style={stepBtn}>−</button>
        <div className="mono" data-testid={testid ? `${testid}-value` : undefined} style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 500 }}>{value}</div>
        <button aria-label={`${label} increase`} data-testid={testid ? `${testid}-inc` : undefined} onClick={() => onChange(value + 1)} style={{ ...stepBtn, borderLeft: "1px solid #e8ebee", borderRight: "none" }}>+</button>
      </div>
    </div>
  );
}
const stepBtn: React.CSSProperties = {
  width: 28, height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
  background: "#f4f6f8", color: "var(--muted)", border: "none", borderRight: "1px solid #e8ebee", fontSize: 14,
};

function HeightChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mono"
      style={{
        flex: 1, height: 28, borderRadius: 7, fontSize: 12, fontWeight: active ? 600 : 500,
        color: active ? "#fff" : "var(--muted)", background: active ? "var(--accent)" : "#f4f6f8",
        border: `1px solid ${active ? "var(--accent)" : "#e8ebee"}`,
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ icon, label, value, onChange, testid }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void; testid?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
      <span style={{ color: value ? "var(--muted)" : "#9097a0" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: value ? "#3a4047" : "var(--muted)" }}>{label}</span>
      <div
        data-testid={testid}
        role="switch"
        aria-label={label}
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{ width: 32, height: 18, borderRadius: 9, background: value ? "var(--accent)" : "#d2d7dc", position: "relative", cursor: "pointer", transition: "background .15s" }}
      >
        <div style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.3)", transition: "left .15s" }} />
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, danger, testid }: { children: React.ReactNode; onClick: () => void; danger?: boolean; testid?: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28,
        border: `1px solid ${danger ? "#f2d9da" : "var(--hairline)"}`, borderRadius: 7,
        color: danger ? "var(--invalid)" : "var(--muted)", background: "#fff",
      }}
    >
      {children}
    </button>
  );
}
