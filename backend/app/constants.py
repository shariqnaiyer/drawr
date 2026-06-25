"""Canonical Gridfinity dimensional constants — the single source of truth.

Every number that defines Gridfinity geometry lives here, with a citation and a
note flagging any value that is an *assumption* rather than a hard spec value, so
it can be verified against real printed parts.

Sources (cross-checked):
  [K] kennetek/gridfinity-rebuilt-openscad  -> src/core/standard.scad
      https://github.com/kennetek/gridfinity-rebuilt-openscad
      https://kennetek.github.io/gridfinity-rebuilt-openscad/constants/
  [Z] Zack Freedman's original Gridfinity Specification (Printables mirror)
      https://www.printables.com/model/417152-gridfinity-specification
  [C] michaelgale/cq-gridfinity (CadQuery cross-check)
      https://github.com/michaelgale/cq-gridfinity

All values are millimetres unless noted. Coordinate convention: Z is up.

------------------------------------------------------------------------------
THE MATING PROFILE (read this to understand the geometry)
------------------------------------------------------------------------------
A bin's foot and a baseplate's socket share one 2D "stair-step" profile, swept
around the rounded square of each grid cell. Measured from the inner-bottom of
the foot, the canonical profile (K) is the polyline:

    [0, 0] -> [0.8, 0.8] -> [0.8, 2.6] -> [2.95, 4.95]
     (x=outward, y=up)

which is three stacked segments:
    1. bottom 45 chamfer : rises 0.8, steps out 0.8
    2. straight wall      : rises 1.8 (2.6 - 0.8), no outward step
    3. top 45 chamfer    : rises 2.35 (4.95 - 2.6), steps out 2.15 (2.95 - 0.8)

Total foot height = 4.95mm [K]. The baseplate socket is the mirror of this so a
bin drops in and self-centres.  NOTE: the often-quoted "2.15" is the *horizontal*
travel of the top chamfer, not a height; the vertical rise is 2.35.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Base grid
# ---------------------------------------------------------------------------
GRID_UNIT: float = 42.0          # [K,Z,C] pitch of one grid cell in X and Y
HEIGHT_UNIT: float = 7.0         # [K,Z,C] one "U" of bin height

# Bins are printed slightly under 42mm so they drop into the baseplate with
# clearance. The full diametric gap is 0.5mm (0.25mm per side) [K BASE_GAP_MM, Z].
GRID_CLEARANCE: float = 0.5      # total, across one unit
BIN_OUTER_PER_UNIT: float = GRID_UNIT - GRID_CLEARANCE  # 41.5mm footprint per 1U [K,Z]

# ---------------------------------------------------------------------------
# Bin foot / mating profile  (see header diagram)
# ---------------------------------------------------------------------------
FOOT_CHAMFER_BOTTOM: float = 0.8   # [K] bottom 45 chamfer height (and outward step)
FOOT_WALL_STRAIGHT: float = 1.8    # [K] straight vertical wall height (2.6 - 0.8)
FOOT_CHAMFER_TOP_RISE: float = 2.35  # [K] top chamfer vertical rise (4.95 - 2.6)
FOOT_CHAMFER_TOP_RUN: float = 2.15   # [K] top chamfer outward travel (2.95 - 0.8)
FOOT_PROFILE_HEIGHT: float = 4.95    # [K] BASE_PROFILE_HEIGHT (Z approximates 4.75)

# Outward offset, per side, from the foot's narrow bottom to its wide top. This
# is how much smaller the very bottom of the foot is than the bin's footprint.
FOOT_TOTAL_RUN: float = FOOT_CHAMFER_BOTTOM + FOOT_CHAMFER_TOP_RUN  # 2.95 [K]

# Corner rounding of the foot/base [K BASE_TOP_RADIUS, Z].
BASE_TOP_RADIUS: float = 3.75
BASE_BOTTOM_RADIUS: float = BASE_TOP_RADIUS - FOOT_TOTAL_RUN  # 0.8; clamp >= small

# ---------------------------------------------------------------------------
# Baseplate
# ---------------------------------------------------------------------------
# The thin/"lite" baseplate is essentially the socket profile plus a thin floor.
# Its recess mirrors the bin foot so seating is exact.
BASEPLATE_PROFILE_HEIGHT: float = 4.65  # [Z] slanted stair-stepped recess height
BASEPLATE_FLOOR_THICKNESS: float = 1.2  # ASSUMPTION: thin solid floor under the
                                        # recess. Real "lite" plates ~1.0-1.4mm;
                                        # verify against your printed plate.
BASEPLATE_OUTER_RADIUS: float = 4.0     # [Z] 0.25mm larger than the bin's 3.75

# ---------------------------------------------------------------------------
# Magnet & screw holes
# ---------------------------------------------------------------------------
# Spec magnet is 6x2mm [Z]. kennetek prints the *hole* at 6.5mm dia / 2.4mm deep
# for press-fit clearance [K]. We default to the nominal spec; bump via API.
MAGNET_HOLE_DIAMETER: float = 6.0   # [Z] (kennetek uses 6.5 for fit)
MAGNET_HOLE_DEPTH: float = 2.0      # [Z] (kennetek uses 2.4)

SCREW_HOLE_DIAMETER: float = 3.0    # [K,Z] M3 clearance
SCREW_HOLE_DEPTH: float = 6.0       # [K,Z] drilled up through the foot

# Holes sit at +/-13mm from each cell centre on both axes -> 26mm spacing.
# Derived: 42/2 - 8 (d_hole_from_side) = 13 [K,Z].
HOLE_OFFSET_FROM_CENTER: float = 13.0

# ---------------------------------------------------------------------------
# Bin body
# ---------------------------------------------------------------------------
WALL_THICKNESS: float = 1.0      # ASSUMPTION-ish: K min is 0.95, cq default 1.0.
DIVIDER_THICKNESS: float = 1.2   # [K] d_div internal divider wall
FLOOR_THICKNESS: float = 1.0     # ASSUMPTION: solid floor added above the foot
                                 # bridge before the usable cavity. Verify.
INNER_FILLET_RADIUS: float = 2.8  # [K] r_f2 internal corner fillet

# Height (Z) of solid material from the very bottom up to the cavity floor. The
# foot region is 4.95; we add FLOOR_THICKNESS of solid before hollowing.
BASE_BRIDGE_HEIGHT: float = HEIGHT_UNIT - FOOT_PROFILE_HEIGHT  # 2.05 [K]

# ---------------------------------------------------------------------------
# Stacking lip (lets bins stack; mirrors the baseplate socket at the bin top)
#   profile [0,0] -> [0.7,0.7] -> [0.7,2.5] -> [2.6,4.4]  [K]
# ---------------------------------------------------------------------------
LIP_CHAMFER_BOTTOM: float = 0.7  # [K]
LIP_WALL_STRAIGHT: float = 1.8   # [K] (2.5 - 0.7)
LIP_CHAMFER_TOP_RISE: float = 1.9  # [K] (4.4 - 2.5)
LIP_CHAMFER_TOP_RUN: float = 1.9   # [K] (2.6 - 0.7)
LIP_HEIGHT: float = 4.4          # [K] STACKING_LIP profile height
LIP_TOTAL_RUN: float = LIP_CHAMFER_BOTTOM + LIP_CHAMFER_TOP_RUN  # 2.6

# ---------------------------------------------------------------------------
# Label tab
# ---------------------------------------------------------------------------
LABEL_TAB_DEPTH: float = 15.85   # [K] TAB_SIZE depth (how far it juts inward)
LABEL_TAB_HEIGHT: float = 13.2   # [K] approx vertical size of the tab shelf
LABEL_TAB_ANGLE: float = 36.0    # [K] support angle (community often cites 45)

# ---------------------------------------------------------------------------
# Scoop
# ---------------------------------------------------------------------------
# Scoop radius is parametric in all canonical sources (no fixed spec value).
# We use a sensible default proportional to a usable cavity. ASSUMPTION.
SCOOP_RADIUS: float = 12.0

# ---------------------------------------------------------------------------
# Mesh / CAD tolerances
# ---------------------------------------------------------------------------
EPS: float = 0.02                # [K TOLLERANCE] geometric epsilon to avoid
                                 # coincident-face slivers in boolean ops.
# STL tessellation quality (passed to the exporter). Smaller = finer mesh.
STL_LINEAR_DEFLECTION: float = 0.05
STL_ANGULAR_DEFLECTION: float = 0.5


def grid_to_mm(units: float) -> float:
    """Convert a count of grid units to millimetres of pitch."""
    return units * GRID_UNIT


def fit_units(physical_mm: float) -> int:
    """How many whole grid units fit within a physical dimension (mm)."""
    return int(physical_mm // GRID_UNIT)
