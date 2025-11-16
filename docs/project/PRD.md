# BrepFlow — Product Requirements Document

_Owner:_ Aureo Labs (a MADFAM company)
_Product:_ **BrepFlow** — web-first, node-based parametric CAD with exact B‑Rep/NURBS
_Domains:_ brepflow\.com · aureolabs.dev · madfam.io
_Doc status:_ Draft v0.1 (2025‑09‑13)

---

## 0) One‑Page Executive Summary

**Problem:** Engineers and designers need Grasshopper‑like visual parametrics with **manufacturing‑grade** geometry (exact B‑Rep/NURBS) that runs in the **browser**, collaborates natively, and integrates cleanly with CAD/CAM/PLM.

**Solution:** **BrepFlow** — a web‑native node graph editor backed by an industrial geometry kernel (OCCT‑class), delivering exact solids/surfaces, STEP/3DM/USD I/O, and a **headless CLI/SDK** for automation.

**Who it’s for:** Product/industrial/mechanical designers, computational designers, R\&D, fixtures/jigs makers, and teams building configurable product families.

**MVP in one sentence:** Build precise parts/assemblies with a **visual graph** in the browser, export **STEP/STL**, and automate **variants** via a **CLI**.

**Top 5 capabilities (MVP):**

1. Node canvas with dirty‑prop evaluation, undo/redo, grouping, and parameter panel.
2. Exact modeling ops: sketch→extrude/revolve/sweep/loft, Booleans, fillet/chamfer/shell/draft.
3. Import **STEP/IGES**; export **STEP/STL** (Phase 1) → add **3DM/USD/glTF** in Phase 2.
4. **Headless** runner (Node.js/CLI) to compute graphs and export artifacts.
5. **SDK** (TypeScript + Python) for custom nodes and pipeline integration.

**Non‑goals (first year):** Photoreal rendering, full drawing package, enterprise PLM, full Class‑A surfacing parity with Rhino.

**Success (12 months):**

- ≥10 internal MADFAM/Aureo projects shipped with BrepFlow;
- ≥3 external pilot teams;
- 80% of target users complete a parametric part → STEP in <30 min;
- Mean compute <1.5s for typical part edits;
- Exported STEP accepted by Onshape/SolidWorks/FreeCAD with zero healing in ≥95% cases.

---

## 1) Objectives & Key Results (OKRs)

**O1 — Deliver a dependable MVP:**

- KR1: Ship MVP feature set (Section 4) by Week 12 with P0 bugs ≤ 5.
- KR2: Achieve viewport ≥ 60 FPS on M1‑class laptops for 1–2M triangles.
- KR3: Boolean ops on medium parts (<50k faces) complete in ≤ 1000 ms p95.

**O2 — Interoperability first:**

- KR4: Round‑trip STEP AP242 with ±1e‑3 mm tolerance; pass import into Onshape, FreeCAD, and SolidWorks test suites.
- KR5: 3DM read (curves/surfaces/solids) and write (curves/surfaces) by Month 6.

**O3 — Automate everything:**

- KR6: CLI renders 50 parameter variants in <5 min on a CI runner; deterministic hashes for outputs.

---

## 2) Audience & Personas

- **Mechanical Designer ("Ana")** — builds fixtures, enclosures, brackets; values exact STEP and fast iteration.
- **Computational Designer ("Luis")** — comfortable with nodes/code; needs loft/sweep and data‑driven arrays.
- **Manufacturing Engineer ("Carla")** — cares about DFM rules, clearances, fillets, and predictable exports.
- **Automation Dev ("Diego")** — integrates CLI into CI, adds custom nodes in TS/Python.

---

## 3) Use Cases (Primary)

1. **Configurable enclosure family:** Graph with parameters (L/W/H, wall, bosses, hole grid) → STEP/STL + BOM props.
2. **Gearbox plates & spacers:** Loft/sweep, hole patterns, param arrays → export STEP to CAM.
3. **Lattice‑reinforced panel (mesh preview, B‑Rep shell):** Pattern nodes + shell/draft; export for printing.
4. **Batch variant generation in CI:** Load graph, set JSON params, export 30 variants overnight.

---

## 4) Scope & MVP

### 4.1 MVP Feature List (P0/P1)

**P0**

- Node canvas: create/connect nodes, pan/zoom, multi‑select, groups, reroute edges, search palette.
- Param panel: units, number sliders, vectors, enums, expressions.
- Core geometry nodes: Plane/Line/Circle/NURBS curve + surface; Extrude/Revolve/Sweep/Loft; Boolean (U/S/I); Fillet/Chamfer/Shell/Draft; Transform (move/rotate/scale/mirror); Pattern (linear/circular); Offset/Project/Trim (2D).
- File I/O: Import STEP/IGES; Export STEP/STL.
- Engine: deterministic topological eval, dirty‑propagation, memoized caches, tesselation worker.
- Headless: CLI/Node API to compute graph and export.
- Save/load: JSON graph with stable IDs, versioning, and embedded units/tolerances.
- Viewport: WebGPU (preferred) with WebGL2 fallback; section planes; isolate/hide.

**P1**

- 3DM (openNURBS) read/write (curves/surfaces, solids where safe).
- USD/glTF export; material & layer metadata.
- Node groups (subgraphs) with exposed inputs; presets.
- Constraint snippets (dimensional on sketches; limited coincident).

### 4.2 Out‑of‑Scope (Year 1)

- Full drafting (dimensions, title blocks) → rely on downstream CAD.
- FEA/CFD/physics; advanced Class‑A surface matching.
- Massive assembly management (we’ll support light assemblies via subgraphs).

---

## 5) UX & IA

- **Left:** Node palette (search + categories).
- **Center:** Node canvas with minimap.
- **Right:** Inspector/params + object tree.
- **Bottom:** Console (errors/warnings), progress, and unit/tolerance chip.
- **Gestures:** GH‑style quick search (⌘/Ctrl+K), hold Alt to insert reroute, double‑click wire to add node.
- **Error affordances:** Red pins, inline messages, and “select upstream cause” jump.

---

## 6) Architecture (High‑Level)

- **Frontend (TypeScript/React):** React Flow or Rete.js for canvas; Zustand for state.
- **Compute (WASM Workers):** OCCT.wasm for B‑Rep/NURBS & STEP/IGES; openNURBS.wasm Phase 2; separate **tesselation worker** returning vertex buffers.
- **Rendering:** WebGPU via wgpu‑rs bindings or Three.js (WebGL2) fallback; frustum culling + LOD.
- **Data:** `.bflow.json` graph (schema‑versioned) + binary mesh cache; deterministic content hashes.
- **Automation:** `brepflow-cli` (Node) loads graphs, injects params (JSON), exports STEP/STL/USD.
- **Extensibility:** Node SDK (TS) + Python bridge (server‑side or Pyodide) for custom nodes.

---

## 7) Data Model (Draft)

```json
{
  "version": "0.1",
  "units": "mm",
  "tolerance": 0.001,
  "nodes": [
    {
      "id": "extrude1",
      "type": "Extrude",
      "inputs": { "profile": "sketchA" },
      "params": { "distance": 25.0, "draft": 2.0 }
    }
  ],
  "edges": [{ "from": "sketchA:out", "to": "extrude1:profile" }],
  "metadata": { "author": "user", "created": 1690000000 }
}
```

---

## 8) Interoperability & Formats

- **Priority:** STEP AP242/IGES (Phase 1) → 3DM/USD/glTF (Phase 2).
- **Units/tolerances** embedded; export healing minimal; names/layers preserved where possible.
- **Downstream CAD:** Onshape, SolidWorks, FreeCAD; printing (STL/3MF via downstream slicers).

---

## 9) Security, Privacy, Compliance

- **No cloud lock‑in for MVP:** client‑side compute by default; optional project sync in Phase 2 (S3‑compatible).
- **Security:** CSP strict; COOP/COEP for WASM threads; sandboxed workers; signed plugin packages.
- **Privacy:** Local storage by default; telemetry opt‑in with anonymized aggregates.
- **Compliance roadmap:** SOC2‑lite controls for hosted sync; SBOM for WASM builds.

---

## 10) Performance & Reliability Targets

- App load (cold): ≤ 3.0 s on M1 Air / modern Windows laptop.
- Viewport: 60 FPS p95 for ≤ 2M tris; 30 FPS for ≤ 5M tris.
- Boolean p95: ≤ 1.0 s on medium complexity (≤ 50k faces).
- Crash guard: worker isolation; autosave every 60 s; recovery on next launch.

---

## 11) Analytics & Telemetry (opt‑in)

- Graph size, node count, compute times (p50/p95), failure codes.
- Export formats used; success/fail rates by target CAD.
- No geometry content captured unless user enables diagnostic bundle.

---

## 12) Packaging, Licensing, Pricing (prelim)

- **Model:** **Open‑core**. Core BrepFlow under **MPL‑2.0** (or LGPL‑3.0); pro features (cloud sync, team spaces, private registry) under commercial license by Aureo Labs.
- **SKU:** BrepFlow Studio (free), Studio Pro (teams), CLI (free for OSS graphs, pro for private registries).
- **Brand:** “BrepFlow by Aureo Labs, a MADFAM company.”

---

## 13) Milestones & Timeline

**Phase 0 (Weeks 0‑2):** Repo scaffold, OCCT.wasm spike, minimal viewport, JSON schema draft.

**Phase 1 (Weeks 3‑8):** Node canvas + P0 geometry nodes; STEP/IGES I/O; tesselation worker; save/load; basic inspector; CLI alpha.

**Phase 2 (Weeks 9‑12):** Stabilize; keyboard UX; grouping; performance passes; MVP release (v0.1). Pilot onboarding.

**Phase 3 (Months 4‑6):** 3DM/USD/glTF; node subgraphs; presets; plugin SDK; telemetry opt‑in; first external pilots.

**Phase 4 (Months 7‑12):** Hosted sync (optional); constraints (limited); marketplace beta; v0.5.

---

## 14) Risks & Mitigations

- **WASM perf/memory limits** → Use workers + threads, streaming I/O, LRU caches.
- **Interop quirks (STEP healing)** → Golden test suite across Onshape/SW/FreeCAD; CI diffing.
- **Name collisions/SEO** → Technical positioning ("B‑Rep"), strong taglines, schema.org metadata.
- **Plugin security** → Signed manifests, sandboxed execution, review queue for registry.

---

## 15) Dependencies

- OCCT.wasm build toolchain; openNURBS.wasm (Phase 2); React + Rete.js/React Flow; Three.js/WebGPU; Vite build; AWS‑compatible object storage (later).

---

## 16) Acceptance Criteria (MVP)

- Create parametric enclosure: 10+ nodes → valid **STEP** imports into Onshape & FreeCAD without repair.
- Boolean torture test completes within targets and renders correctly.
- CLI runs headless on CI to export 20 variants; outputs are deterministic by hash.
- Crash/recovery verified; autosave present.

---

## 17) Open Questions

- Final choice: **Rete.js** vs **React Flow** (processing vs canvas polish).
- License: **MPL‑2.0** vs **LGPL‑3.0** for core?
- Do we ship mesh nodes (e.g., `hull/minkowski`) in MVP or Phase 2?
- How deep do we go on constraints in Year 1?

---

## 18) Appendix

- **Glossary:** B‑Rep, NURBS, STEP AP242, 3DM, USD, Tesselation, Dirty‑prop.
- **Design tokens (draft):** neutral dark UI, accent color for node categories, dyslexia‑friendly fonts optional.
- **Brand seeds:** Wordmark “BrepFlow”; mark evokes knot vector grid + flow lines; sub‑brands: Studio, CLI, SDK, Registry, Loom (viewer).
