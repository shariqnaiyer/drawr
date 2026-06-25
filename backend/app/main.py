"""FastAPI service: turn a design spec (JSON) into watertight STL files.

Endpoints
  GET  /api/health                 -> liveness
  GET  /api/constants              -> the Gridfinity constants (for the frontend)
  POST /api/grid/compute           -> fit units to physical mm, or mm to units
  POST /api/stl/bin                -> a single bin STL (used by the 3D preview)
  POST /api/stl/baseplate          -> a single baseplate STL (3D preview)
  POST /api/export                 -> ZIP of every unique part for a design

The export de-duplicates identical bins (same footprint/height/features) so a
layout with seven 1x1 bins exports one STL, and names files sensibly.
"""

from __future__ import annotations

import io
import logging
import os
import time
import zipfile

from build123d import export_stl
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import constants as C
from . import geometry as geo
from .schema import BinSpec, DesignSpec

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("gridfinity")

# Sentry (no-op unless SENTRY_DSN is set in the environment).
_SENTRY_DSN = os.getenv("SENTRY_DSN")
if _SENTRY_DSN:
    import sentry_sdk

    sentry_sdk.init(dsn=_SENTRY_DSN, traces_sample_rate=0.1,
                    environment=os.getenv("ENVIRONMENT", "production"))

app = FastAPI(title="Gridfinity Studio API", version="1.0.0")

# Per-IP rate limiting for the expensive CAD endpoints.
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: locked to configured frontend origins (plus any *.vercel.app preview).
# ALLOWED_ORIGINS is a comma-separated list; defaults cover local dev.
_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log each request with its wall-clock duration (CAD builds can be slow)."""
    start = time.perf_counter()
    response = await call_next(request)
    dur_ms = (time.perf_counter() - start) * 1000
    log.info("%s %s -> %s %.0fms", request.method, request.url.path,
             response.status_code, dur_ms)
    return response


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _bin_to_stl_bytes(b: BinSpec) -> bytes:
    part = geo.build_bin(
        b.w, b.d, b.height_u,
        comp_cols=b.compartments.cols,
        comp_rows=b.compartments.rows,
        label=b.label, scoop=b.scoop,
        magnet_holes=b.magnet_holes, screw_holes=b.screw_holes,
    )
    return _export_bytes(part)


def _export_bytes(part) -> bytes:
    """Export a build123d part to STL and return the bytes (via a temp file,
    which is how OCP's writer works)."""
    import tempfile, os
    fd, path = tempfile.mkstemp(suffix=".stl")
    os.close(fd)
    try:
        export_stl(part, path,
                   tolerance=C.STL_LINEAR_DEFLECTION,
                   angular_tolerance=C.STL_ANGULAR_DEFLECTION)
        with open(path, "rb") as f:
            return f.read()
    finally:
        os.unlink(path)


# ---------------------------------------------------------------------------
# Simple endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/constants")
def constants():
    """Expose the dimensional constants the UI needs to render to scale."""
    return {
        "grid_unit": C.GRID_UNIT,
        "height_unit": C.HEIGHT_UNIT,
        "grid_clearance": C.GRID_CLEARANCE,
        "bin_outer_per_unit": C.BIN_OUTER_PER_UNIT,
    }


class GridComputeRequest(BaseModel):
    mode: str  # "dimensions" or "units"
    width_mm: float | None = None
    depth_mm: float | None = None
    cols: int | None = None
    rows: int | None = None


@app.post("/api/grid/compute")
def grid_compute(req: GridComputeRequest):
    """Compute the complementary grid representation.

    dimensions -> how many whole units fit + the resulting baseplate size and
    the leftover margin. units -> the real-world baseplate size.
    """
    if req.mode == "dimensions":
        cols = C.fit_units(req.width_mm or 0)
        rows = C.fit_units(req.depth_mm or 0)
    else:
        cols = req.cols or 1
        rows = req.rows or 1
    plate_w = C.grid_to_mm(cols)
    plate_d = C.grid_to_mm(rows)
    margin_x = ((req.width_mm or plate_w) - plate_w) / 2.0
    margin_y = ((req.depth_mm or plate_d) - plate_d) / 2.0
    return {
        "cols": cols, "rows": rows,
        "plate_width_mm": plate_w, "plate_depth_mm": plate_d,
        "margin_x_mm": round(margin_x, 2), "margin_y_mm": round(margin_y, 2),
    }


# ---------------------------------------------------------------------------
# STL endpoints
# ---------------------------------------------------------------------------
@app.post("/api/stl/bin")
@limiter.limit("60/minute")
def stl_bin(request: Request, b: BinSpec):
    data = _bin_to_stl_bytes(b)
    return Response(content=data, media_type="model/stl",
                    headers={"Content-Disposition": f'attachment; filename="{b.footprint_key()}.stl"'})


class BaseplateOnly(BaseModel):
    cols: int
    rows: int
    magnet_holes: bool = False
    screw_holes: bool = False


@app.post("/api/stl/baseplate")
@limiter.limit("60/minute")
def stl_baseplate(request: Request, p: BaseplateOnly):
    part = geo.build_baseplate(p.cols, p.rows,
                               magnet_holes=p.magnet_holes, screw_holes=p.screw_holes)
    data = _export_bytes(part)
    return Response(content=data, media_type="model/stl",
                    headers={"Content-Disposition": f'attachment; filename="baseplate_{p.cols}x{p.rows}.stl"'})


# ---------------------------------------------------------------------------
# Export: ZIP of all unique parts
# ---------------------------------------------------------------------------
def _build_credits(spec: DesignSpec) -> str:
    """Markdown crediting each imported community model with its license + link."""
    lines = [
        f"# {spec.name} — community models",
        "",
        "These models were placed from the community library. They are **not**",
        "included in this download — download each from its source and follow its",
        "license (attribution, non-commercial, share-alike, etc.).",
        "",
    ]
    for m in spec.models:
        fp = f" ({m.width_u}×{m.depth_u})" if m.width_u and m.depth_u else ""
        lines.append(f"## {m.title}{fp}")
        if m.author:
            lines.append(f"- Author: {m.author}")
        if m.license:
            lines.append(f"- License: {m.license}")
        if m.source_url:
            lines.append(f"- Source: {m.source_url}")
        lines.append("")
    return "\n".join(lines)


@app.post("/api/export")
@limiter.limit("20/minute")
def export(request: Request, spec: DesignSpec):
    """Build every unique part and return them bundled as a ZIP."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Baseplate
        if spec.include_baseplate:
            plate = geo.build_baseplate(
                spec.baseplate.cols, spec.baseplate.rows,
                magnet_holes=spec.baseplate.magnet_holes,
                screw_holes=spec.baseplate.screw_holes,
            )
            zf.writestr(
                f"baseplate_{spec.baseplate.cols}x{spec.baseplate.rows}.stl",
                _export_bytes(plate),
            )

        # Unique bins (dedupe identical parts; record how many of each)
        unique: dict[str, BinSpec] = {}
        counts: dict[str, int] = {}
        for b in spec.bins:
            k = b.footprint_key()
            counts[k] = counts.get(k, 0) + 1
            unique.setdefault(k, b)

        for key, b in unique.items():
            qty = counts[key]
            name = f"{key}{'_x' + str(qty) if qty > 1 else ''}.stl"
            zf.writestr(name, _bin_to_stl_bytes(b))

        # Imported community models: we don't generate their STLs, but we credit
        # them and link to the source so the user downloads them legally.
        if spec.models:
            zf.writestr("CREDITS.md", _build_credits(spec))

    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in spec.name) or "gridfinity"
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{safe}.zip"'},
    )
