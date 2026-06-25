"""API contract tests: grid math, export bundling/dedup, and validation."""

import io
import zipfile

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_grid_compute_dimensions():
    r = client.post("/api/grid/compute", json={"mode": "dimensions", "width_mm": 300, "depth_mm": 220})
    body = r.json()
    assert (body["cols"], body["rows"]) == (7, 5)
    assert body["plate_width_mm"] == 294 and body["plate_depth_mm"] == 210
    assert body["margin_x_mm"] == 3.0 and body["margin_y_mm"] == 5.0


def test_grid_compute_units():
    r = client.post("/api/grid/compute", json={"mode": "units", "cols": 4, "rows": 3})
    body = r.json()
    assert (body["plate_width_mm"], body["plate_depth_mm"]) == (168, 126)


def test_export_bundles_baseplate_and_deduped_bins():
    spec = {
        "name": "Drawer A",
        "baseplate": {"cols": 3, "rows": 2},
        "bins": [
            {"id": "a", "x": 0, "y": 0, "w": 1, "d": 1, "height_u": 3},
            {"id": "b", "x": 1, "y": 0, "w": 1, "d": 1, "height_u": 3},  # identical -> deduped
            {"id": "c", "x": 2, "y": 0, "w": 1, "d": 2, "height_u": 6},
        ],
    }
    r = client.post("/api/export", json=spec)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/zip"

    names = zipfile.ZipFile(io.BytesIO(r.content)).namelist()
    assert any(n.startswith("baseplate_3x2") for n in names)
    # two unique bin parts (the two 1x1x3 collapse into one, marked _x2)
    bin_names = [n for n in names if n.startswith("bin_")]
    assert len(bin_names) == 2
    assert any("_x2" in n for n in bin_names)


def test_export_can_omit_baseplate():
    spec = {
        "baseplate": {"cols": 2, "rows": 2},
        "bins": [{"id": "a", "x": 0, "y": 0, "w": 1, "d": 1, "height_u": 3}],
        "include_baseplate": False,
    }
    names = zipfile.ZipFile(io.BytesIO(client.post("/api/export", json=spec).content)).namelist()
    assert not any(n.startswith("baseplate") for n in names)


@pytest.mark.parametrize("bins", [
    # out of bounds (2-wide bin at the right edge of a 1-col grid would overflow)
    [{"id": "a", "x": 0, "y": 0, "w": 3, "d": 1, "height_u": 3}],
    # overlap
    [
        {"id": "a", "x": 0, "y": 0, "w": 2, "d": 2, "height_u": 3},
        {"id": "b", "x": 1, "y": 1, "w": 1, "d": 1, "height_u": 3},
    ],
])
def test_invalid_layouts_are_rejected(bins):
    spec = {"baseplate": {"cols": 2, "rows": 2}, "bins": bins}
    assert client.post("/api/export", json=spec).status_code == 422


def test_export_writes_credits_for_imported_models():
    spec = {
        "baseplate": {"cols": 3, "rows": 2},
        "bins": [{"id": "a", "x": 0, "y": 0, "w": 1, "d": 1, "height_u": 3}],
        "models": [
            {"title": "Universal Screwdriver holder", "author": "Audacity Micro",
             "source_url": "https://www.printables.com/model/1071118", "license": "CC0-1.0",
             "width_u": 2, "depth_u": 1},
        ],
    }
    r = client.post("/api/export", json=spec)
    assert r.status_code == 200
    zf = zipfile.ZipFile(io.BytesIO(r.content))
    assert "CREDITS.md" in zf.namelist()
    credits = zf.read("CREDITS.md").decode()
    assert "Universal Screwdriver holder" in credits
    assert "CC0-1.0" in credits
    assert "printables.com/model/1071118" in credits
    # the model is NOT built as an STL
    assert not any("screwdriver" in n.lower() and n.endswith(".stl") for n in zf.namelist())


def test_single_bin_stl_endpoint():
    r = client.post("/api/stl/bin", json={"id": "x", "x": 0, "y": 0, "w": 1, "d": 1, "height_u": 3})
    assert r.status_code == 200
    assert r.headers["content-type"] == "model/stl"
    assert len(r.content) > 1000  # a real mesh
