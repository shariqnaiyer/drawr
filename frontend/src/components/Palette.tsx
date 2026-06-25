import { Plus } from "lucide-react";
import { useStore } from "../store";

// Footprint presets shown in the floating palette. Click one to start placing.
const FOOTPRINTS: { w: number; d: number; label: string }[] = [
  { w: 1, d: 1, label: "1×1" },
  { w: 2, d: 1, label: "2×1" },
  { w: 2, d: 2, label: "2×2" },
  { w: 3, d: 1, label: "3×1" },
  { w: 3, d: 2, label: "3×2" },
  { w: 4, d: 2, label: "4×2" },
];

export function Palette() {
  const { pendingFootprint, tool, setPendingFootprint } = useStore();

  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 5,
        background: "rgba(26,30,37,.82)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 11,
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 24px rgba(0,0,0,.4)",
        zIndex: 10,
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 9, fontWeight: 600, color: "#7e8893", letterSpacing: ".08em", textTransform: "uppercase", padding: "0 6px 0 4px" }}
      >
        Bins
      </span>
      {FOOTPRINTS.map((fp) => {
        const active = tool === "add" && pendingFootprint.w === fp.w && pendingFootprint.d === fp.d;
        return (
          <div
            key={fp.label}
            data-testid={`fp-${fp.w}x${fp.d}`}
            onClick={() => setPendingFootprint(fp.w, fp.d)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "7px 8px 6px",
              borderRadius: 8,
              cursor: "pointer",
              background: active ? "var(--accent-soft)" : "transparent",
              border: active ? "1px solid var(--accent)" : "1px solid transparent",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${fp.w},5px)`, gap: 1.5 }}>
              {Array.from({ length: fp.w * fp.d }).map((_, i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: 1.5, background: active ? "var(--accent)" : "#6b7682" }} />
              ))}
            </div>
            <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: active ? "var(--accent-ink)" : "#9aa3ad" }}>
              {fp.label}
            </span>
          </div>
        );
      })}
      <div style={{ width: 1, height: 30, background: "rgba(255,255,255,.09)", margin: "0 2px" }} />
      <div
        title="Custom size — set in inspector after placing"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, color: "#9aa3ad" }}
      >
        <Plus size={16} />
      </div>
    </div>
  );
}
