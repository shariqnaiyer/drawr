"""Pydantic models defining the design-spec contract between the React frontend
and the CAD backend.

A *design* is one drawer-sized Gridfinity layout: an N x M baseplate plus a set
of bins placed on its grid. The frontend sends one of these as JSON; the backend
turns every unique part into a watertight STL and returns them bundled as a ZIP.

All coordinates are in **grid units** (1 unit = GRID_UNIT mm, see constants.py),
with the origin at the top-left cell. Heights are in **U** (1 U = HEIGHT_UNIT mm).
"""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, model_validator

# Build-cost guards. CAD generation is CPU-heavy, so the public API caps how
# large a single design can be to keep request times and memory bounded.
MAX_GRID_CELLS = 600       # e.g. up to ~24x25; covers any realistic drawer
MAX_BINS = 200             # bins per design


class Compartments(BaseModel):
    """Internal divider layout of a bin, as a simple cols x rows split.

    cols/rows = 1 means a single open compartment (no dividers).
    """

    cols: int = Field(1, ge=1, le=12, description="Compartment columns (vertical dividers + 1)")
    rows: int = Field(1, ge=1, le=12, description="Compartment rows (horizontal dividers + 1)")


class BinSpec(BaseModel):
    """A single bin placed on the grid."""

    id: str = Field(..., description="Stable client id, used for naming the STL")

    # Placement: top-left cell of the bin's footprint, in grid units.
    x: int = Field(..., ge=0, description="Column of the bin's top-left cell (0-based)")
    y: int = Field(..., ge=0, description="Row of the bin's top-left cell (0-based)")

    # Footprint, in grid units.
    w: int = Field(..., ge=1, le=20, description="Width in units")
    d: int = Field(..., ge=1, le=20, description="Depth in units")

    # Vertical size, in U (7mm increments).
    height_u: int = Field(6, ge=2, le=30, description="Height in U (7mm each)")

    compartments: Compartments = Field(default_factory=Compartments)

    # Feature toggles.
    label: bool = Field(True, description="Add the front label tab/shelf")
    scoop: bool = Field(True, description="Add the curved scoop ramp at the front")
    magnet_holes: bool = Field(True, description="Add 6x2mm magnet holes in the feet")
    screw_holes: bool = Field(False, description="Add M3 screw holes in the feet")
    solid_lid: bool = Field(False, description="Solid block (lid/spacer) — no cavity")

    def footprint_key(self) -> str:
        """Identity for de-duplication: two bins with the same key are identical
        parts and only need to be exported once."""
        c = self.compartments
        kind = "lid" if self.solid_lid else "bin"
        return (
            f"{kind}_{self.w}x{self.d}x{self.height_u}u"
            f"_c{c.cols}x{c.rows}"
            f"_lab{int(self.label)}_sco{int(self.scoop)}"
            f"_mag{int(self.magnet_holes)}_scr{int(self.screw_holes)}"
        )


class BaseplateSpec(BaseModel):
    """The baseplate grid that bins seat into."""

    cols: int = Field(..., ge=1, le=30, description="Grid columns (X)")
    rows: int = Field(..., ge=1, le=30, description="Grid rows (Y)")
    magnet_holes: bool = Field(False, description="Add magnet holes to the baseplate")
    screw_holes: bool = Field(False, description="Add screw holes to the baseplate")


class CreditModel(BaseModel):
    """An imported community model placed on the grid. We don't generate its STL
    (it lives on its source host); on export we record it in CREDITS.md so the
    user can download it and honour its license."""

    title: str
    author: str = ""
    source_url: str = ""
    license: str = ""
    width_u: int | None = None
    depth_u: int | None = None


class DesignSpec(BaseModel):
    """A complete drawer design: one baseplate + its bins."""

    name: str = Field("drawr design", description="Used to name the ZIP")
    baseplate: BaseplateSpec
    bins: list[BinSpec] = Field(default_factory=list)
    include_baseplate: bool = Field(True, description="Export the baseplate STL")
    models: list[CreditModel] = Field(default_factory=list, description="Imported community models (credits only)")

    @model_validator(mode="after")
    def _within_build_limits(self):
        """Reject designs that would be too expensive to build."""
        cells = self.baseplate.cols * self.baseplate.rows
        if cells > MAX_GRID_CELLS:
            raise ValueError(f"Grid too large ({cells} cells); max is {MAX_GRID_CELLS}")
        if len(self.bins) > MAX_BINS:
            raise ValueError(f"Too many bins ({len(self.bins)}); max is {MAX_BINS}")
        return self

    @field_validator("bins")
    @classmethod
    def _no_overlaps_in_bounds(cls, bins: list[BinSpec], info):  # noqa: ANN001
        """Reject overlapping or out-of-bounds bins so we never try to build an
        invalid layout. The frontend prevents these too, but the API is the
        source of truth."""
        plate: BaseplateSpec | None = info.data.get("baseplate")
        if plate is None:
            return bins
        occupied: set[tuple[int, int]] = set()
        for b in bins:
            if b.x + b.w > plate.cols or b.y + b.d > plate.rows:
                raise ValueError(f"Bin {b.id} ({b.w}x{b.d} at {b.x},{b.y}) is out of bounds")
            for cx in range(b.x, b.x + b.w):
                for cy in range(b.y, b.y + b.d):
                    if (cx, cy) in occupied:
                        raise ValueError(f"Bin {b.id} overlaps another bin at cell {cx},{cy}")
                    occupied.add((cx, cy))
        return bins
