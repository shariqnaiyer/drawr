import { useRef, useState } from "react";
import { Plus, AlertTriangle, X, Package, ExternalLink } from "lucide-react";
import { useStore, canPlace } from "../store";
import type { Bin } from "../types";
import { GRID_UNIT, HEIGHT_UNIT } from "../types";

const CELL = 60; // base px per grid unit at 100% zoom

// A rectangle drawn out by dragging, normalised to top-left + size.
function rectFrom(ax: number, ay: number, cx: number, cy: number) {
  return {
    x: Math.min(ax, cx),
    y: Math.min(ay, cy),
    w: Math.abs(cx - ax) + 1,
    d: Math.abs(cy - ay) + 1,
  };
}

export function Canvas2D() {
  const {
    grid, bins, selectedId, tool, pendingFootprint, zoom,
    select, addBin, moveBin,
  } = useStore();

  const cell = CELL * zoom;
  const stageRef = useRef<HTMLDivElement>(null);

  // drawing a brand-new bin (Add tool) — anchor + current cell + whether moved
  const [draw, setDraw] = useState<{ ax: number; ay: number; cx: number; cy: number; moved: boolean } | null>(null);
  // moving an existing bin
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);

  // pointer -> grid cell, clamped to the board so previews never escape it
  const cellAt = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(grid.cols - 1, Math.floor((clientX - r.left) / cell)));
    const y = Math.max(0, Math.min(grid.rows - 1, Math.floor((clientY - r.top) / cell)));
    return { x, y };
  };

  // start drawing a new bin on empty grid (Add tool)
  const onStageMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || tool !== "add") return;
    const { x, y } = cellAt(e.clientX, e.clientY);
    setDraw({ ax: x, ay: y, cx: x, cy: y, moved: false });
  };

  // begin moving an existing bin — works regardless of the active tool, so
  // placed components are always draggable
  const startBinDrag = (e: React.MouseEvent, b: Bin) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    select(b.id);
    const { x, y } = cellAt(e.clientX, e.clientY);
    setDrag({ id: b.id, dx: x - b.x, dy: y - b.y, x: b.x, y: b.y });
  };

  const onMove = (e: React.MouseEvent) => {
    if (drag) {
      const { x, y } = cellAt(e.clientX, e.clientY);
      const nx = x - drag.dx;
      const ny = y - drag.dy;
      if (nx !== drag.x || ny !== drag.y) setDrag({ ...drag, x: nx, y: ny });
    } else if (draw) {
      const { x, y } = cellAt(e.clientX, e.clientY);
      if (x !== draw.cx || y !== draw.cy) setDraw({ ...draw, cx: x, cy: y, moved: true });
    }
  };

  const onUp = () => {
    if (drag) {
      moveBin(drag.id, drag.x, drag.y);
      setDrag(null);
    }
    if (draw) {
      // a plain click (no drag) places the palette footprint; a drag draws a
      // custom rectangle spanning the cells you swept over
      const r = draw.moved
        ? rectFrom(draw.ax, draw.ay, draw.cx, draw.cy)
        : { x: draw.ax, y: draw.ay, w: pendingFootprint.w, d: pendingFootprint.d };
      addBin(r.x, r.y, r.w, r.d);
      setDraw(null);
    }
  };

  // background click clears the selection
  const onStageClick = (e: React.MouseEvent) => {
    if (tool !== "add" && e.target === e.currentTarget) select(null);
  };

  // --- live previews --------------------------------------------------------
  const drawRect = draw
    ? draw.moved
      ? rectFrom(draw.ax, draw.ay, draw.cx, draw.cy)
      : { x: draw.ax, y: draw.ay, w: pendingFootprint.w, d: pendingFootprint.d }
    : null;
  const drawPreview = drawRect
    ? { ...drawRect, ok: canPlace(grid, bins, drawRect.x, drawRect.y, drawRect.w, drawRect.d) }
    : null;

  const movingBin = drag ? bins.find((b) => b.id === drag.id) : null;
  const dragPreview =
    drag && movingBin
      ? { x: drag.x, y: drag.y, w: movingBin.w, d: movingBin.d,
          ok: canPlace(grid, bins, drag.x, drag.y, movingBin.w, movingBin.d, drag.id) }
      : null;

  const invalid =
    (drawPreview && !drawPreview.ok) || (dragPreview && !dragPreview.ok);

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        background: "radial-gradient(130% 120% at 50% 28%, #1d232c 0%, #15181d 62%, #111418 100%)",
        userSelect: "none",
      }}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={() => { setDrag(null); setDraw(null); }}
    >
      {/* subtle backdrop grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {/* scale chip */}
      <Chip style={{ top: 14, left: 14 }}>1 U = {GRID_UNIT} mm</Chip>

      {/* stage */}
      <div style={{ position: "relative", margin: 80 }}>
        <div
          style={{
            position: "absolute",
            inset: -14,
            borderRadius: 14,
            background: "var(--plate)",
            border: "1px solid #262b33",
            boxShadow: "0 30px 70px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.03)",
          }}
        />

        {/* rulers */}
        {Array.from({ length: grid.cols }).map((_, i) => (
          <div key={`c${i}`} className="mono"
            style={{ position: "absolute", top: -22, left: i * cell + cell / 2, transform: "translateX(-50%)", fontSize: 9, color: "#6b7480" }}>
            {i}
          </div>
        ))}
        {Array.from({ length: grid.rows }).map((_, j) => (
          <div key={`r${j}`} className="mono"
            style={{ position: "absolute", left: -22, top: j * cell + cell / 2, transform: "translateY(-50%)", fontSize: 9, color: "#6b7480" }}>
            {j}
          </div>
        ))}

        <div
          ref={stageRef}
          data-testid="canvas-stage"
          onMouseDown={onStageMouseDown}
          onClick={onStageClick}
          style={{
            position: "relative",
            width: grid.cols * cell,
            height: grid.rows * cell,
            cursor: tool === "add" ? "crosshair" : "default",
          }}
        >
          {/* baseplate cells */}
          {Array.from({ length: grid.cols * grid.rows }).map((_, idx) => {
            const i = idx % grid.cols;
            const j = Math.floor(idx / grid.cols);
            return (
              <div key={idx} style={{ position: "absolute", left: i * cell, top: j * cell, width: cell, height: cell, padding: 4, pointerEvents: "none" }}>
                <div style={{ width: "100%", height: "100%", border: "1px solid var(--gridline)", borderRadius: 7, background: "rgba(255,255,255,.014)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.18)" }} />
              </div>
            );
          })}

          {/* bins */}
          {bins.map((b) => {
            const isDragging = drag?.id === b.id;
            const bx = isDragging ? drag!.x : b.x;
            const by = isDragging ? drag!.y : b.y;
            return (
              <BinView
                key={b.id}
                bin={b}
                cell={cell}
                x={bx}
                y={by}
                selected={selectedId === b.id}
                ghost={isDragging}
                onMouseDown={(e) => startBinDrag(e, b)}
                onClick={(e) => { e.stopPropagation(); select(b.id); }}
              />
            );
          })}

          {/* new-bin draw preview */}
          {drawPreview && <PreviewBox cell={cell} {...drawPreview} mode="draw" />}

          {/* moving-bin preview (only when it would be invalid; valid moves show
              the ghost bin itself) */}
          {dragPreview && !dragPreview.ok && (
            <PreviewBox cell={cell} {...dragPreview} mode="move" />
          )}
        </div>
      </div>

      {/* invalid placement badge */}
      {invalid && (
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 5, height: 24, padding: "0 9px", background: "var(--invalid)", color: "#fff", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          <AlertTriangle size={12} /> Invalid placement
        </div>
      )}
    </div>
  );
}

function PreviewBox({
  cell, x, y, w, d, ok, mode,
}: { cell: number; x: number; y: number; w: number; d: number; ok: boolean; mode: "draw" | "move" }) {
  return (
    <div style={{ position: "absolute", left: x * cell, top: y * cell, width: w * cell, height: d * cell, padding: 3, pointerEvents: "none", zIndex: 8 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 8,
          background: ok ? "var(--accent-glow)" : "rgba(229,72,77,.24)",
          border: `1.5px dashed ${ok ? "var(--accent)" : "var(--invalid)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {mode === "move" ? (
          <X size={18} color="var(--invalid)" />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: ok ? "var(--accent)" : "var(--invalid)", color: "#fff" }}>
            {ok ? <Plus size={16} /> : <X size={16} />}
          </div>
        )}
        {/* size readout while drawing */}
        <div className="mono" style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", background: ok ? "var(--accent)" : "var(--invalid)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>
          {w}×{d}
        </div>
      </div>
    </div>
  );
}

function BinView({
  bin, cell, x, y, selected, ghost, onMouseDown, onClick,
}: {
  bin: Bin; cell: number; x: number; y: number; selected: boolean; ghost: boolean;
  onMouseDown: (e: React.MouseEvent) => void; onClick: (e: React.MouseEvent) => void;
}) {
  const w = bin.w * cell;
  const h = bin.d * cell;
  const lines = bin.comp.cols - 1;
  const isModel = bin.kind === "model";
  return (
    <div
      data-testid="bin"
      data-bin-id={bin.id}
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: "absolute",
        left: x * cell,
        top: y * cell,
        width: w,
        height: h,
        padding: 3,
        cursor: ghost ? "grabbing" : "grab",
        opacity: ghost ? 0.5 : 1,
        zIndex: selected ? 6 : 2,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 8,
          background: isModel
            ? "linear-gradient(157deg,#324063 0%,#28324d 100%)"
            : "linear-gradient(157deg,var(--bin-face-a) 0%,var(--bin-face-b) 100%)",
          border: `1px solid ${isModel ? "#4a5f8c" : "var(--bin-edge)"}`,
          boxShadow: selected ? "0 12px 26px rgba(0,0,0,.45)" : "0 6px 16px rgba(0,0,0,.34)",
        }}
      >
        {/* top sheen */}
        <div style={{ position: "absolute", inset: "1px 1px auto 1px", height: 9, borderRadius: "7px 7px 0 0", background: "linear-gradient(rgba(255,255,255,.11),rgba(255,255,255,0))", pointerEvents: "none" }} />

        {/* ---- bin (generated) visuals ---- */}
        {!isModel && (
          <>
            {bin.label && (
              <div style={{ position: "absolute", top: -1, left: 9, width: 30, height: 11, background: "#3d4651", border: "1px solid #4b5662", borderBottom: "none", borderRadius: "4px 4px 0 0", clipPath: "polygon(0 0,100% 0,86% 100%,14% 100%)", pointerEvents: "none" }} />
            )}
            {bin.scoop && (
              <div style={{ position: "absolute", left: 3, right: 3, bottom: 3, height: "42%", borderRadius: "0 0 6px 6px", background: "linear-gradient(to top,rgba(255,255,255,.085),rgba(255,255,255,0))", pointerEvents: "none" }} />
            )}
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} style={{ position: "absolute", top: 6, bottom: 6, left: `${((i + 1) / bin.comp.cols) * 100}%`, width: 1, background: "rgba(255,255,255,.13)", pointerEvents: "none" }} />
            ))}
            {Array.from({ length: bin.comp.rows - 1 }).map((_, i) => (
              <div key={`h${i}`} style={{ position: "absolute", left: 6, right: 6, top: `${((i + 1) / bin.comp.rows) * 100}%`, height: 1, background: "rgba(255,255,255,.13)", pointerEvents: "none" }} />
            ))}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "rgba(214,220,226,.5)", letterSpacing: ".04em", pointerEvents: "none" }}>
              {bin.w}×{bin.d}
            </div>
          </>
        )}

        {/* ---- imported community model ---- */}
        {isModel && bin.model && (
          <div style={{ position: "absolute", inset: 0, padding: "7px 8px", display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Package size={13} style={{ color: "#8fa6d6" }} />
              <ExternalLink size={11} style={{ color: "#7f93bd" }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#dfe6f1", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {bin.model.title}
            </div>
            <div style={{ marginTop: "auto", fontSize: 9, color: "#9fb0cf", fontFamily: "'IBM Plex Mono',monospace" }}>
              {bin.model.license}
            </div>
          </div>
        )}

        {/* height badge */}
        <div className="mono" style={{ position: "absolute", left: 5, bottom: 4, fontSize: 10, fontWeight: 500, color: "#aeb6bf", background: "rgba(0,0,0,.32)", padding: "1px 5px", borderRadius: 4, pointerEvents: "none" }}>
          {bin.heightU}U
        </div>

        {/* selection chrome */}
        {selected && (
          <>
            <div style={{ position: "absolute", inset: -3, border: "2px solid var(--accent)", borderRadius: 10, boxShadow: "0 0 0 4px var(--accent-glow)", pointerEvents: "none" }} />
            {[["l", "t"], ["r", "t"], ["l", "b"], ["r", "b"]].map(([hx, hy], i) => (
              <div key={i} style={{ position: "absolute", [hx === "l" ? "left" : "right"]: -5, [hy === "t" ? "top" : "bottom"]: -5, width: 9, height: 9, background: "#fff", border: "2px solid var(--accent)", borderRadius: 2, pointerEvents: "none" } as React.CSSProperties} />
            ))}
            <div className="mono" style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 5, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,.3)", pointerEvents: "none" }}>
              {bin.w}×{bin.d} U <span style={{ opacity: 0.6 }}>·</span> {bin.heightU * HEIGHT_UNIT} mm
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="mono"
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 26,
        padding: "0 10px",
        background: "rgba(30,35,43,.7)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 7,
        fontSize: 10,
        fontWeight: 500,
        color: "#9aa3ad",
        backdropFilter: "blur(4px)",
        zIndex: 9,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
