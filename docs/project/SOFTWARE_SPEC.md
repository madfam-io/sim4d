# Sim4D — SOFTWARE_SPEC.md

_Owner:_ Aureo Labs (a MADFAM company)
_Product:_ **Sim4D** — Web‑first, node‑based parametric CAD on exact B‑Rep/NURBS
_Doc:_ Software Specification
_Status:_ Draft v0.1 · 2025‑09‑13

> **Purpose** — This spec defines the architecture, modules, data formats, APIs, performance budgets, and non‑functional requirements to deliver Sim4D MVP (v0.1) and set foundations for v0.5.

---

## 1. Scope & Principles

**In‑scope (MVP):** Node editor, deterministic graph engine, WASM geometry core (OCCT), STEP/IGES import, STEP/STL export, WebGL2/WebGPU viewport, JSON graph persistence, CLI/headless, TypeScript SDK for custom nodes.

**Out‑of‑scope (MVP):** Drawings package, PLM/PDM, advanced Class‑A surfacing, physics/FEA, massive assemblies.

**Design principles:**

- **Exactness by default** (OCCT B‑Rep/NURBS)
- **Web‑native UX** (no installs; workers; transferables)
- **Engine/UI separation** (canvas‑agnostic execution)
- **Deterministic & cacheable** (stable IDs + content hashing)
- **Interop first** (STEP AP242 priority; 3DM/USD next)
- **Extensible** (typed Node SDK; sandboxed plugins)

---

## 2. System Architecture (High‑Level)

```
+-----------------------+        +---------------------------+        +--------------------+
|  React App (Studio)   |<-----> |  Engine Host (Main Thread)| <----> |  Viewport Renderer |
|  - Node Canvas (RF)   |   IPC  |  - Graph Store (Zustand)  |  IPC   |  (Three.js/WebGPU) |
|  - Inspector/Console  |        |  - Worker Manager         |        |                    |
+-----------------------+        +-------------^-------------+        +---------^----------+
                                              |                                  |
                                     Transferables                       GPU Buffers
                                              |                                  |
                               +--------------+---------------+
                               |   WASM Workers (Isolated)    |
                               |  - occt.wasm Geometry Core   |
                               |  - Tessellation Worker       |
                               |  - Plugin Nodes (sandboxed)  |
                               +--------------^---------------+
                                              |
                                        FS/Cache Layer (IDB/MEMFS)
```

**Canvas:** React + **React Flow** (pluggable; Rete.js compatible adapter later).
**Engine:** TS execution engine in main thread; geometry offloaded to workers.
**Geometry core:** **OCCT.wasm** (Emscripten, pthreads enabled) for exact B‑Rep/NURBS + STEP/IGES I/O.
**Rendering:** **Three.js (WebGL2)** default; **WebGPU** renderer behind feature flag for modern browsers.
**Storage:** Graph JSON in browser storage + project files via File System Access API; binary caches in IndexedDB.

---

## 3. Repos & Packaging

**Monorepo:** pnpm workspaces + Turborepo

```
/ sim4d
  /apps
    /studio          # React app (editor)
  /packages
    /engine-core     # Graph evaluator, scheduling, hashing
    /engine-occt     # Worker bindings to occt.wasm (C++/TS glue)
    /viewport        # Three.js/WebGPU viewport
    /nodes-core      # Built-in node set (TS declarations + worker ops)
    /sdk             # Public SDK for custom nodes & plugins
    /cli             # Node.js CLI for headless compute & export
    /schemas         # JSON schema for .bflow.json
    /examples        # Graphs, fixtures, golden models
    /types           # Shared types
  /third_party       # Submodules: occt, openNURBS (phase 2)
```

**Build:** Vite (apps) · tsup (libs) · Emscripten (occt.wasm).
**Lint/Test:** ESLint, Prettier, Vitest/Jest, Playwright (E2E).

---

## 4. Data Model

### 4.1 Graph File (`.bflow.json`)

Versioned JSON (UTF‑8). Stable IDs (UUIDv7). Units & tolerances embedded.

```json
{
  "version": "0.1",
  "units": "mm",
  "tolerance": 0.001,
  "nodes": [
    { "id": "sk1", "type": "Sketch2D", "params": {}, "state": {} },
    {
      "id": "ex1",
      "type": "Extrude",
      "inputs": { "profile": "sk1:face" },
      "params": { "distance": 25 }
    }
  ],
  "edges": [{ "from": "sk1:face", "to": "ex1:profile" }],
  "metadata": { "created": "2025-09-13T12:00:00Z", "author": "user" }
}
```

### 4.2 Node Definition (Core)

```ts
export type ParamValue = number | string | boolean | Vec3 | Mat4 | EnumVal | Expr;
export interface NodeInstance<I = any, O = any, P = any> {
  id: NodeId;
  type: NodeType;
  inputs: Partial<Record<keyof I, SocketRef>>;
  params: P; // serializable
  state?: Record<string, unknown>; // non‑serialized editor state
}
export interface NodeDef<I, O, P> {
  type: NodeType;
  inputs: Record<keyof I, SocketSpec>;
  outputs: Record<keyof O, SocketSpec>;
  params: ParamSpec<P>;
  evaluate(ctx: EvalCtx, inputs: I, params: P): Promise<O>;
}
```

### 4.3 Shape Handles & Hashing

- **Opaque handles** in workers; main thread stores `HandleId` strings.
- **Content hash** (xxHash64) over OCCT B‑Rep persistence (BREP string) + params + inputs.
- **Memoization**: node output cache keyed by `(nodeId, inputHashes, paramHash)`.

---

## 5. Execution Model

- **Dirty Propagation:** On param/input change → mark downstream nodes dirty → topological re‑eval.
- **Scheduling:** BFS by levels; coalesce micro‑tasks; debounce rapid edits (16–32ms).
- **Determinism:** Evaluation order derived from DAG; no nondeterministic sources.
- **Cancellation:** Per‑node abort controller; stale computations dropped.

Pseudocode:

```ts
function recompute(changed: Set<NodeId>) {
  const queue = topoOrder.filter((n) => isAffected(n, changed));
  for (const nid of queue) {
    const inVals = readInputs(nid);
    const key = hash(nid, inVals, params[nid]);
    if (cache.has(key)) {
      setOutputs(nid, cache.get(key));
      continue;
    }
    const out = await evalNode(nid, inVals, params[nid]);
    cache.set(key, out);
    setOutputs(nid, out);
  }
}
```

---

## 6. Geometry Core (occt.wasm)

### 6.1 Build Targets

- Emscripten `-sWASM=1 -sUSE_PTHREADS=1 -sALLOW_MEMORY_GROWTH=1`
- COOP/COEP headers required for threads (served via dev server & production CDN).
- OCCT modules: ModelingData, ModelingAlgorithms, BRep, BRepAlgo, STEPCAFControl, IGESControl, BRepMesh.

### 6.2 Worker API (Message Protocol)

```ts
// Request
{ kind:"MAKE_EXTRUDE", id:"ex1", input:{ face: HandleId }, params:{ distance: number, draft?: number }, deflection?: number }
// Response (success)
{ id:"ex1", ok:true, out:{ shape: HandleId, aabb: {min:Vec3,max:Vec3}, tri: TransferMeta } }
// Response (error)
{ id:"ex1", ok:false, error:{ code:"GEOM_BOOLEAN_FAIL", message:"BOP check failed", detail?:any } }
```

All geometry ops live **inside worker**. Triangulations are returned as transferable `ArrayBuffer`s (positions, indices, normals) via a separate tessellation worker when needed.

### 6.3 Tessellation Pipeline

- Use `BRepMesh_IncrementalMesh` with **deflection** derived from model size & pixel density.
- LODs: `{preview: 0.5%, medium: 0.2%, high: 0.1%}` of bbox diagonal.
- Cache: `HandleId -> {lod -> MeshBuffers}` in worker; LRU eviction by bytes.

### 6.4 Error Classes

`GEOM_BOOLEAN_FAIL`, `GEOM_FILLET_FAIL`, `GEOM_INVALID_INPUT`, `IMPORT_ERROR`, `EXPORT_ERROR`, `MEMORY_LIMIT`.

---

## 7. Rendering

- Default: **Three.js WebGL2** renderer; core features: PBR-ish mat, edges, x‑ray, section planes, selection outlines.
- **WebGPU** path behind experimental flag (Chrome/Edge/Safari TP). Switchable adapters at runtime.
- Instanced draws for arrays; frustum culling; screen‑space edge rendering.

---

## 8. Built‑in Nodes (MVP)

**Sketch/Curve:** Line, Circle, Arc, Polyline, NURBS Curve, Offset, Fillet2D, Trim2D, Project.
**Surface/Solid:** Plane, NURBS Surface, Loft, Sweep, Revolve, Extrude.
**Booleans:** Union, Subtract, Intersect (with check).
**Features:** Fillet (edge/vertex), Chamfer, Shell, Draft.
**Xforms:** Move, Rotate, Scale, Mirror, Array (linear/circular).
**I/O:** Import STEP/IGES, Export STEP/STL.
**Utilities:** Bounds, Measure, Material/Layer tag.
Each node exposes: **preview toggle**, **error badge**, **compute time**.

---

## 9. Units, Tolerances, Expressions

- **Units:** default mm; supported: mm, cm, m, in. Values are unit‑aware (`10 mm + 0.5 in`).
- **Model tolerance:** default 1e‑3 in graph header; ops use this unless overridden.
- **Expression language:** safe evaluator (subset: + − × ÷, pow, min/max, trig, conditionals). References other params by `node.param` or global `@L`/`@W` conventions. No user‑defined functions in MVP.

---

## 10. Interoperability

- **Import:** STEP AP242, IGES 5.3 (Phase 1); 3DM (openNURBS) Phase 2.
- **Export:** STEP AP242, STL (binary) (MVP); glTF/USD (Phase 2).
- **Metadata:** preserve names/layers where available; write unit/tolerance notes.

---

## 11. CLI & Automation

**Package:** `@sim4d/cli`

```
$ sim4d render graph.bflow.json \
    --set L=120 --set W=80 --out out/ --export step,stl \
    --quality high --hash

$ sim4d sweep variants.json --graph enclosure.bflow.json --matrix params.csv
```

- Headless Node.js; loads same WASM builds.
- Outputs deterministic content hashes; writes `manifest.json` with artifacts & provenance.
- Exit codes: `0` ok, `2` recoverable errors (some nodes failed), `10` fatal.

---

## 12. SDK & Plugins

**Goal:** Allow third parties to add nodes without compromising stability/security.

### 12.1 Node SDK (TypeScript)

```ts
registerNode<Inputs, Outputs, Params>({
  type: 'MyCompany::Gear',
  params: {
    module: NumberParam({ min: 0.1 }),
    teeth: IntParam({ min: 6 }),
    pressureAngle: EnumParam(['20', '14.5']),
  },
  inputs: { axis: 'Vector', plane: 'Plane' },
  outputs: { shape: 'Shape' },
  evaluate: async (ctx, I, P) =>
    ctx.geom.invoke('GEAR_MAKE', { module: P.module, z: P.teeth, pa: P.pressureAngle }),
});
```

`ctx.geom.invoke` marshals to worker op; plugins cannot access DOM or network by default.

### 12.2 Plugin Packaging

- `package.json` with `sim4d` manifest block (node list, version range).
- Signed bundle (ed25519) for registry distribution; local dev bypass via flag.
- Sandboxed execution in a dedicated worker with a **capability whitelist**.

---

## 13. Performance Budgets (MVP)

- App cold load ≤ **3.0 s** on M1/modern Windows.
- Viewport ≥ **60 FPS** at ≤ **2M** triangles; ≥ 30 FPS at ≤ 5M.
- Typical boolean (<50k faces) ≤ **1000 ms** p95.
- Memory ceiling per tab: **1.5–2.0 GB** (graceful degradation beyond).

---

## 14. Reliability & Recovery

- Autosave every 60 s; 5 versions kept.
- Crash guard: worker isolation; restart worker on fault; surface error to console with replay info.
- Project backup export (zip: graph + assets + meshes) for issue reports.

---

## 15. Security & Privacy

- COOP/COEP enabled for WASM threads.
- CSP strict; no inline eval; Subresource Integrity for CDN assets.
- Plugins: no network/file access unless permitted; message quota & timeouts.
- Telemetry: **opt‑in**; aggregates only (counts, timings). Diagnostic bundle explicit.

---

## 16. Testing Strategy

- **Unit:** geometry adapters, hashing, expression evaluator.
- **Integration:** node chains (golden outputs via STEP hashes + mesh stats).
- **E2E:** Playwright flows: create→edit→export; recover from crash.
- **Interoperability:** Import/export round‑trips against Onshape, FreeCAD, SolidWorks in CI using headless import validators (where possible) and STEP parsers.
- **Fuzz:** Random param sweeps on representative graphs; watch for OCCT exceptions.

---

## 17. Accessibility & i18n

- Keyboard‑first graph editing (tab/focus rings, shortcuts, ARIA for canvas items).
- Color‑contrast AA; color‑independent cues.
- i18n scaffolding via ICU MessageFormat; initial locales: en, es.

---

## 18. Logging & Telemetry (Opt‑in)

- Events: node create/delete, compute timings, worker restarts, import/export success.
- No geometry payloads by default; hashed identifiers only.
- Privacy mode for offline use (default in enterprise builds).

---

## 19. Config & Feature Flags

- `bflow.config.json` in project root: renderer (`webgl2|webgpu`), tessellation quality, autosave interval.
- Flags: `webgpu`, `plugins`, `telemetry`, `3dm-io`.

---

## 20. Roadmap Hooks (v0.5+)

- 3DM read/write (openNURBS.wasm).
- USD/glTF export; USD stage viewer.
- Node subgraphs/presets; constraint snippets; mesh ops (hull/minkowski).
- Marketplace & signed plugin registry; team sync (self‑hosted S3).

---

## 21. Open Questions

- Final render backend choice for WebGPU (native vs Three.js WebGPU renderer)?
- Tolerance strategy per op vs global (how exposed in UI)?
- Topological naming across edits (MVP: best‑effort; v0.5: robust mapping?).

---

## 22. License & Credits

- Core: **MPL‑2.0** (tentative).
- Geometry: OCCT (LGPL‑2.1 + exception) dynamically linked via WASM.
- Acknowledgements: OCCT, Three.js, React Flow.

---

## 23. Glossary

**B‑Rep**: Boundary Representation; **NURBS**: Non‑Uniform Rational B‑Splines; **DAG**: Directed Acyclic Graph; **LOD**: Level of Detail; **COOP/COEP**: Cross‑Origin isolation headers for SharedArrayBuffer.
