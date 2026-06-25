import {
  MousePointer2, SquarePlus, Hand, Undo2, Redo2, Trash2, Settings2,
} from "lucide-react";
import { useStore } from "../store";
import type { Tool } from "../types";

function RailBtn({
  active, onClick, title, children, testid,
}: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; testid?: string }) {
  return (
    <div
      onClick={onClick}
      title={title}
      data-testid={testid}
      role="button"
      aria-label={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 9,
        cursor: "pointer",
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--muted)",
      }}
    >
      {children}
    </div>
  );
}

export function LeftRail() {
  const { tool, setTool, undo, redo, deleteBin, selectedId, past, future } = useStore();
  const pick = (t: Tool) => setTool(t);

  return (
    <div
      style={{
        width: 52,
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--hairline)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 0",
        gap: 3,
      }}
    >
      <RailBtn testid="tool-select" active={tool === "select"} onClick={() => pick("select")} title="Select / Move">
        <MousePointer2 size={18} />
      </RailBtn>
      <RailBtn testid="tool-add" active={tool === "add"} onClick={() => pick("add")} title="Add bin">
        <SquarePlus size={18} />
      </RailBtn>
      <RailBtn testid="tool-pan" active={tool === "pan"} onClick={() => pick("pan")} title="Pan">
        <Hand size={18} />
      </RailBtn>

      <div style={{ width: 24, height: 1, background: "#e1e4e8", margin: "5px 0" }} />

      <RailBtn testid="tool-delete" onClick={() => selectedId && deleteBin(selectedId)} title="Delete selected">
        <Trash2 size={18} style={{ opacity: selectedId ? 1 : 0.4 }} />
      </RailBtn>
      <RailBtn testid="tool-undo" onClick={undo} title="Undo">
        <Undo2 size={18} style={{ opacity: past.length ? 1 : 0.4 }} />
      </RailBtn>
      <RailBtn testid="tool-redo" onClick={redo} title="Redo">
        <Redo2 size={18} style={{ opacity: future.length ? 1 : 0.4 }} />
      </RailBtn>

      <div style={{ marginTop: "auto" }}>
        <RailBtn onClick={() => {}} title="Settings">
          <Settings2 size={18} />
        </RailBtn>
      </div>
    </div>
  );
}
