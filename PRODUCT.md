# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Makers with a 3D printer who want to organize a real drawer with Gridfinity bins. They usually have a drawer measured with a ruler or calipers, they're at a desk or workbench in daylight on a laptop, desktop, or iPad, and they want a slicer-ready set of files without learning CAD.

## Product Purpose

drawr (formerly Gridfinity Studio) turns a drawer's inner dimensions into a complete Gridfinity layout: a baseplate plus parametric bins, laid out visually, previewed in 3D, and exported as watertight, print-ready STL files in one ZIP. It works when the parts seat into real baseplates and the user goes from a measured drawer to printing in minutes.

## Positioning

Geometry comes from a real CAD kernel (build123d / OpenCascade) on the backend, not mesh hacks. Every dimension is cross-checked against three canonical Gridfinity sources (kennetek, Zack Freedman's spec, cq-gridfinity), and every exported part is verified watertight and manifold. The 2D layout and the 3D preview stay in sync, and the export de-duplicates identical parts.

## Operating Context

- Flow: Setup (drawer mm ⇄ unit count, computed by the backend) → Design (2D canvas + inspector, 3D preview) → Export (ZIP of unique STLs + CREDITS.md).
- Community model library: a bundled metadata catalog (gridfinity-model-catalog). Imported models reserve footprint and link to their source; they are never rehosted. Permissive generators produce real, editable bins.
- Licenses matter: every catalog model shows its verified license, and non-commercial ones are flagged.

## Capabilities and Constraints

- Grid pitch 42 mm, height unit 7 mm, bin footprint 41.5 mm per unit (0.25 mm clearance per side).
- Bin options: footprint W×D (U), height 2–20 U, compartments (cols × rows), solid lid/spacer, label tab, scoop, magnet holes, screw holes. Duplicate, delete, apply to all, undo/redo.
- Placement rules: no overlaps, no out-of-bounds placements (enforced with visible feedback).
- The 3D preview is a client-side approximation; the backend CAD solids are the source of truth for export.
- Devices: desktop and iPad (touch) for the editor; phones get the landing page and a note to use a bigger screen.

## Brand Commitments

- Name: **drawr** (always lowercase). It replaces "Gridfinity Studio" everywhere.
- The user asked for Apple's and Stripe's design methodologies (clarity, deference to content, precise information design). These are methodologies, not borrowed branding.
- Credit: Gridfinity was created by Zack Freedman. The project is MIT-licensed and open source.

## Evidence on Hand

- Verified dimension table and assumptions: README.md and backend/app/constants.py.
- Catalog: frontend/src/catalog/models.json (35 entries, some with Printables thumbnails).
- No testimonials, user counts, or press exist. Don't invent them.

## Product Principles

1. Dimensionally honest: never display a number the CAD kernel wouldn't build.
2. The layout is the hero: chrome defers to the grid and the parts.
3. Respect creators: link, credit, and show licenses; never rehost.
4. Minutes, not hours: from a measured drawer to a ZIP in one sitting.
