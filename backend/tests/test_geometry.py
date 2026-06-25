"""Geometry correctness: every exported part must be watertight/manifold and
match the canonical Gridfinity dimensions. These lock the verified geometry in
place so refactors can't silently regress it."""

import os
import tempfile

import pytest
import trimesh
from build123d import export_stl

from app import constants as C
from app import geometry as geo


def _mesh(part):
    """Export a build123d part and load it back as a trimesh for inspection."""
    fd, path = tempfile.mkstemp(suffix=".stl")
    os.close(fd)
    try:
        export_stl(part, path, tolerance=C.STL_LINEAR_DEFLECTION,
                   angular_tolerance=C.STL_ANGULAR_DEFLECTION)
        return trimesh.load(path)
    finally:
        os.unlink(path)


# A spread of bins covering every feature toggle and divider layout.
BIN_CASES = [
    dict(w=1, d=1, height_u=6),
    dict(w=2, d=1, height_u=3, label=False, scoop=False, magnet_holes=False),
    dict(w=3, d=2, height_u=6, comp_cols=3, comp_rows=2, magnet_holes=True, screw_holes=True),
    dict(w=2, d=2, height_u=12, comp_cols=2, comp_rows=1),
]


@pytest.mark.parametrize("kw", BIN_CASES)
def test_bins_are_watertight(kw):
    m = _mesh(geo.build_bin(**kw))
    assert m.is_watertight, f"bin {kw} not watertight"
    assert m.is_winding_consistent, f"bin {kw} winding inconsistent"
    assert m.volume > 0


@pytest.mark.parametrize("cols,rows,holes", [(2, 2, False), (3, 3, True)])
def test_baseplates_are_watertight(cols, rows, holes):
    m = _mesh(geo.build_baseplate(cols, rows, magnet_holes=holes, screw_holes=holes))
    assert m.is_watertight
    assert m.is_winding_consistent


def test_bin_dimensions_match_spec():
    # 1x1x6 -> 41.5 x 41.5 x 42mm (footprint = 42 - 0.5 clearance, height = 6 * 7)
    bb = geo.build_bin(1, 1, 6).bounding_box()
    assert bb.size.X == pytest.approx(41.5, abs=0.01)
    assert bb.size.Y == pytest.approx(41.5, abs=0.01)
    assert bb.size.Z == pytest.approx(42.0, abs=0.01)

    # 3x2x3 -> 125.5 x 83.5 x 21mm
    bb = geo.build_bin(3, 2, 3).bounding_box()
    assert bb.size.X == pytest.approx(125.5, abs=0.01)
    assert bb.size.Y == pytest.approx(83.5, abs=0.01)
    assert bb.size.Z == pytest.approx(21.0, abs=0.01)


def test_baseplate_dimensions_match_spec():
    # 7x5 plate -> 294 x 210mm (whole-unit pitch, no clearance on the plate)
    bb = geo.build_baseplate(7, 5).bounding_box()
    assert bb.size.X == pytest.approx(294.0, abs=0.01)
    assert bb.size.Y == pytest.approx(210.0, abs=0.01)


def test_hole_positions_are_symmetric_and_count_correct():
    # 2x1 footprint => 2 cells => 8 holes, all at +/-13mm offsets from cell centres
    pts = geo._hole_positions(2, 1)
    assert len(pts) == 8
    for x, y in pts:
        # each coordinate is a cell-centre +/- 13
        assert any(abs(abs(x - cx) - 13.0) < 1e-6 for cx in (-21, 21))
