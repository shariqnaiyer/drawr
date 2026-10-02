import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AlertCircle, Package } from "lucide-react";
import { useStore, canPlace, inBounds } from "../store";
import type { Bin, Grid } from "../types";
import { GRID_UNIT, HEIGHT_UNIT } from "../types";
import { filament as getFilament, type Filament } from "../lib/filament";

const CELL = 64; // base px per grid unit at 100% zoom
// canvas padding that the floating chrome sits in (keep in sync with editor.css)
const PAD_X = 84 * 2;
const PAD_Y = 84 + 132;

// A rectangle drawn out by dragging, normalised to top-left + size.
function rectFrom(ax: number, ay: number, cx: number, cy: number) {
  return { x: Math.min(ax, cx), y: Math.min(ay, cy), w: Math.abs(cx - ax) + 1, d: Math.abs(cy - ay) + 1 };
}

/** Why a footprint can't go here, in plain words (null when it can). */
function placementProblem(grid: Grid, bins: Bin[], x: number, y: number, w: number, d: number, ignoreId?: string) {
  if (!inBounds(grid, x, y, w, d)) return "Doesn't fit inside the grid";
  if (!canPlace(grid, bins, x, y, w, d, ignoreId)) return "Overlaps another bin";
  return null;
}

type Draw = { ax: number; ay: number; cx: number; cy: number; moved: boolean };
type Drag = { id: string; dx: number; dy: number; x: number; y: number; ox: number; oy: number };

export function Canvas2D() {
  const { grid, bins, selectedId, tool, pendingFootprint, zoom, filament, select, addBin, moveBin, setZoom } = useStore();
  const fil = getFilament(filament);
  const cell = CELL * zoom;
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [draw, setDraw] = useState<Draw | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const pan = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  // ---- zoom to fit -------------------------------------------------------
  const fit = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const zx = (el.clientWidth - PAD_X) / (grid.cols * CELL);
    const zy = (el.clientHeight - PAD_Y) / (grid.rows * CELL);
    setZoom(Math.min(1.5, Math.max(0.4, Math.floor(Math.min(zx, zy) * 20) / 20)));
  }, [grid.cols, grid.rows, setZoom]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    window.addEventListener("drawr:fit", fit);
    return () => window.removeEventListener("drawr:fit", fit);
  }, [fit]);

  // pinch (trackpad) or ⌘/ctrl + scroll zooms
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const z = useStore.getState().zoom;
      setZoom(z * Math.exp(-e.deltaY * 0.01));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  // pointer -> grid cell, clamped to the board so previews never escape it
  const cellAt = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(grid.cols - 1, Math.floor((clientX - r.left) / cell)));
    const y = Math.max(0, Math.min(grid.rows - 1, Math.floor((clientY - r.top) / cell)));
    return { x, y };
  };

  // ---- pointer handling (mouse, pen and touch alike) ---------------------
  const onScrollPointerDown = (e: React.PointerEvent) => {
    if (tool !== "pan" || e.button !== 0) return;
    const el = scrollRef.current!;
    pan.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };

  const onStagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || tool === "pan") return;
    if (tool === "add") {
      const { x, y } = cellAt(e.clientX, e.clientY);
      stageRef.current!.setPointerCapture(e.pointerId);
      setDraw({ ax: x, ay: y, cx: x, cy: y, moved: false });
    } else if (e.target === e.currentTarget) {
      select(null);
    }
  };

  // moving an existing bin works with any tool except pan, so placed parts
  // are always draggable
  const startBinDrag = (e: React.PointerEvent, b: Bin) => {
    if (e.button !== 0 || tool === "pan") return;
    e.stopPropagation();
    select(b.id);
    const { x, y } = cellAt(e.clientX, e.clientY);
    stageRef.current!.setPointerCapture(e.pointerId);
    setDrag({ id: b.id, dx: x - b.x, dy: y - b.y, x: b.x, y: b.y, ox: b.x, oy: b.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pan.current) {
      const el = scrollRef.current!;
      el.scrollLeft = pan.current.sl - (e.clientX - pan.current.x);
      el.scrollTop = pan.current.st - (e.clientY - pan.current.y);
      return;
    }
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

  const onPointerUp = () => {
    pan.current = null;
    if (drag) {
      if (drag.x !== drag.ox || drag.y !== drag.oy) moveBin(drag.id, drag.x, drag.y);
      setDrag(null);
    }
    if (draw) {
      // a tap places the preset footprint; a drag draws the cells swept over
      const r = draw.moved
        ? rectFrom(draw.ax, draw.ay, draw.cx, draw.cy)
        : { x: draw.ax, y: draw.ay, w: pendingFootprint.w, d: pendingFootprint.d };
      addBin(r.x, r.y, r.w, r.d);
      setDraw(null);
    }
  };

  const onPointerCancel = () => {
    pan.current = null;
    setDrag(null);
    setDraw(null);
  };

  // ---- live previews -----------------------------------------------------
  const drawRect = draw
    ? draw.moved
      ? rectFrom(draw.ax, draw.ay, draw.cx, draw.cy)
      : { x: draw.ax, y: draw.ay, w: pendingFootprint.w, d: pendingFootprint.d }
    : null;
  const drawProblem = drawRect ? placementProblem(grid, bins, drawRect.x, drawRect.y, drawRect.w, drawRect.d) : null;

  const movingBin = drag ? bins.find((b) => b.id === drag.id) : null;
  const dragRect = drag && movingBin ? { x: drag.x, y: drag.y, w: movingBin.w, d: movingBin.d } : null;
  const dragProblem = dragRect && drag ? placementProblem(grid, bins, dragRect.x, dragRect.y, dragRect.w, dragRect.d, drag.id) : null;

  const problem = drawProblem ?? dragProblem;

  return (
    <div
      ref={scrollRef}
      className={`canvas-scroll${tool === "pan" ? " panning" : ""}`}
      onPointerDown={onScrollPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="canvas-inner">
        <div className="plate-wrap">
          <div className="plate" aria-hidden />

          {bins.length === 0 && !draw && (
            <p className="canvas-hint">
              {tool === "add" ? (
                <>Click a cell to place a <b className="num">{pendingFootprint.w}×{pendingFootprint.d}</b> bin, or drag across cells to draw any size.</>
              ) : (
                <>Choose a size in the dock below, then click the grid.</>
              )}
            </p>
          )}

          <Dimension axis="h" mm={grid.cols * GRID_UNIT} />
          <Dimension axis="v" mm={grid.rows * GRID_UNIT} />

          <div
            ref={stageRef}
            className="stage"
            data-testid="canvas-stage"
            onPointerDown={onStagePointerDown}
            style={{
              width: grid.cols * cell,
              height: grid.rows * cell,
              cursor: tool === "add" ? "crosshair" : tool === "pan" ? "inherit" : "default",
            }}
          >
            {Array.from({ length: grid.cols * grid.rows }).map((_, idx) => {
              const i = idx % grid.cols;
              const j = Math.floor(idx / grid.cols);
              return (
                <div key={idx} className="socket" style={{ left: i * cell, top: j * cell, width: cell, height: cell }}>
                  <div />
                </div>
              );
            })}

            {bins.map((b) => {
              const isDragging = drag?.id === b.id;
              return (
                <BinView
                  key={b.id}
                  bin={b}
                  fil={fil}
                  cell={cell}
                  x={isDragging ? drag!.x : b.x}
                  y={isDragging ? drag!.y : b.y}
                  selected={selectedId === b.id && !isDragging}
                  dragging={isDragging}
                  onPointerDown={(e) => startBinDrag(e, b)}
                />
              );
            })}

            {drawRect && <Ghost cell={cell} {...drawRect} bad={!!drawProblem} />}
            {dragRect && dragProblem && <Ghost cell={cell} {...dragRect} bad />}
          </div>
        </div>
      </div>

      {problem && (
        <div className="canvas-toast" role="status">
          <AlertCircle size={15} /> {problem}
        </div>
      )}
    </div>
  );
}

function Dimension({ axis, mm }: { axis: "h" | "v"; mm: number }) {
  const cap: React.CSSProperties =
    axis === "h" ? { top: 0, width: 1, height: 12 } : { left: 0, height: 1, width: 12 };
  return (
    <div className={`dim ${axis}`} aria-hidden>
      <i className="dim-cap" style={{ ...cap, ...(axis === "h" ? { left: 0 } : { top: 0 }) }} />
      <span className="dim-label num">{mm} mm</span>
      <i className="dim-cap" style={{ ...cap, ...(axis === "h" ? { right: 0 } : { bottom: 0 }) }} />
    </div>
  );
}

function Ghost({ cell, x, y, w, d, bad }: { cell: number; x: number; y: number; w: number; d: number; bad: boolean }) {
  return (
    <div className={`ghost${bad ? " bad" : ""}`} style={{ left: x * cell, top: y * cell, width: w * cell, height: d * cell }}>
      <div>
        <span className="ghost-size num">{w}×{d}</span>
      </div>
    </div>
  );
}

function BinView({
  bin, fil, cell, x, y, selected, dragging, onPointerDown,
}: {
  bin: Bin; fil: Filament; cell: number; x: number; y: number; selected: boolean; dragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const isModel = bin.kind === "model";
  const tiny = Math.min(bin.w, bin.d) * cell < 56;
  const pos: React.CSSProperties = { left: x * cell, top: y * cell, width: bin.w * cell, height: bin.d * cell, zIndex: selected ? 6 : 2 };
  const cls = `bin${selected ? " selected" : ""}${dragging ? " dragging" : ""}`;

  const tip = selected && (
    <div className="bin-tip num">
      {bin.w} × {bin.d}
      <span className="dot">·</span>
      {bin.heightU * HEIGHT_UNIT} mm tall
    </div>
  );

  if (isModel && bin.model) {
    const m = bin.model;
    return (
      <div className={cls} data-testid="bin" data-bin-id={bin.id} style={pos} onPointerDown={onPointerDown}
        aria-label={`${m.title}, ${bin.w} by ${bin.d}`}>
        <div className="bin-body model-body" style={{ boxShadow: undefined }}>
          {m.thumbnail ? (
            <img src={m.thumbnail} alt="" draggable={false} referrerPolicy="no-referrer" />
          ) : (
            <div className="model-hatch" />
          )}
          <div className={`model-meta${m.thumbnail ? "" : " plain"}`} style={{ padding: tiny ? "4px 5px" : undefined }}>
            {!m.thumbnail && <Package size={14} style={{ color: "var(--ink-3)", marginBottom: "auto" }} />}
            <div className="model-title">{m.title}</div>
            {!tiny && <div className="model-lic num">{m.license}</div>}
          </div>
          {tip}
        </div>
      </div>
    );
  }

  const shadow = `0 1px 1px rgba(0,0,0,.14), 0 6px 14px -4px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.18)`;
  return (
    <div className={cls} data-testid="bin" data-bin-id={bin.id} style={pos} onPointerDown={onPointerDown}
      aria-label={`Bin ${bin.w} by ${bin.d}, ${bin.heightU} U`}>
      <div
        className="bin-body"
        style={{
          background: `linear-gradient(170deg, ${fil.face}, ${fil.face} 55%, ${fil.side})`,
          boxShadow: shadow,
        }}
      >
        {!bin.solid && (
          <div
            className="bin-cavity"
            style={{
              background: `linear-gradient(180deg, ${fil.deep}, ${fil.side})`,
              boxShadow: `inset 0 2px 5px rgba(0,0,0,.28)`,
            }}
          >
            {/* label tab along the back (top) wall */}
            {bin.label && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: Math.max(5, cell * 0.14), background: fil.face, borderBottom: `1px solid ${fil.side}` }} />
            )}
            {/* scoop: a lit ramp along the front (bottom) wall */}
            {bin.scoop && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: `linear-gradient(to top, ${fil.face}, transparent)`, opacity: 0.55 }} />
            )}
            {Array.from({ length: bin.comp.cols - 1 }).map((_, i) => (
              <div key={`c${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${((i + 1) / bin.comp.cols) * 100}%`, width: 2, marginLeft: -1, background: fil.face }} />
            ))}
            {Array.from({ length: bin.comp.rows - 1 }).map((_, i) => (
              <div key={`r${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${((i + 1) / bin.comp.rows) * 100}%`, height: 2, marginTop: -1, background: fil.face }} />
            ))}
          </div>
        )}
        {bin.solid && (
          <div style={{ position: "absolute", inset: 5, borderRadius: 6, background: `repeating-linear-gradient(-45deg, rgba(255,255,255,.07) 0 5px, transparent 5px 10px)` }} />
        )}
        <div className="bin-label num" style={{ color: fil.ink }}>
          <span className="bin-size" style={{ textShadow: bin.solid ? undefined : "0 1px 2px rgba(0,0,0,.25)" }}>
            {bin.w}×{bin.d}
          </span>
          {!tiny && <span className="bin-h">{bin.solid ? `lid · ${bin.heightU}U` : `${bin.heightU}U`}</span>}
        </div>
        {tip}
      </div>
    </div>
  );
}
