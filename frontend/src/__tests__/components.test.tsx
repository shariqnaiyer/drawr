import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Inspector } from "../components/Inspector";
import { Palette } from "../components/Palette";
import { useStore } from "../store";
import type { Bin } from "../types";

const s = () => useStore.getState();

function seedBin(): Bin {
  const b: Bin = {
    id: "b1", x: 0, y: 0, w: 3, d: 2, heightU: 6,
    comp: { cols: 3, rows: 1 },
    label: true, scoop: true, magnetHoles: true, screwHoles: false,
  };
  useStore.setState({ grid: { cols: 7, rows: 5 }, bins: [b], selectedId: "b1", past: [], future: [] });
  return b;
}

describe("Inspector", () => {
  beforeEach(() => useStore.setState({ bins: [], selectedId: null, past: [], future: [] }));

  it("shows an empty state when nothing is selected", () => {
    render(<Inspector />);
    expect(screen.getByText(/No bin selected/i)).toBeInTheDocument();
  });

  it("renders the selected bin and edits flow back to the store", () => {
    seedBin();
    render(<Inspector />);
    expect(screen.getByText("Bin · 3×2")).toBeInTheDocument();

    // toggle the scoop off
    fireEvent.click(screen.getByTestId("toggle-scoop"));
    expect(s().bins[0].scoop).toBe(false);

    // bump compartment columns
    fireEvent.click(screen.getByTestId("comp-cols-inc"));
    expect(s().bins[0].comp.cols).toBe(4);

    // height slider
    fireEvent.change(screen.getByTestId("height-slider"), { target: { value: "12" } });
    expect(s().bins[0].heightU).toBe(12);
  });

  it("duplicate adds a second bin", () => {
    seedBin();
    render(<Inspector />);
    fireEvent.click(screen.getByTestId("inspector-duplicate"));
    expect(s().bins).toHaveLength(2);
  });
});

describe("Palette", () => {
  beforeEach(() => useStore.setState({ tool: "select", pendingFootprint: { w: 1, d: 1 } }));

  it("selecting a footprint switches to the add tool and sets the size", () => {
    render(<Palette />);
    fireEvent.click(screen.getByTestId("fp-2x1"));
    expect(s().tool).toBe("add");
    expect(s().pendingFootprint).toEqual({ w: 2, d: 1 });
  });
});
