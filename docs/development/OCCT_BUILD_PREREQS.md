# OCCT Build Prerequisites

The BrepFlow geometry runtime depends on a WebAssembly build of **Open CASCADE Technology (OCCT)**. This document lists the tooling, environment variables, and outputs you need in place before running `scripts/build-occt.sh` or `pnpm run build:wasm`.

> **TL;DR**: Install Emscripten, point the build scripts at a local OCCT checkout, and make sure the generated artefacts appear under `packages/engine-occt/wasm/`.

## 1. Required toolchain

| Dependency                                                                   | Version (tested) | Notes                                                                                                           |
| ---------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) | 3.1.45+          | Required for `emcc`, `em++`, `emmake`, `emcmake`. Install under `third_party/emsdk/` or add to `PATH` globally. |
| CMake                                                                        | 3.24+            | Pulled in automatically by emsdk; otherwise install via your package manager.                                   |
| Ninja / Make                                                                 | Either is fine   | `build-occt.sh` uses `make`; feel free to swap to Ninja if you maintain the script.                             |
| Python 3                                                                     | 3.9+             | Needed by the OCCT build system during configuration.                                                           |

## 2. Directory layout

```
brepflow/
  third_party/
    emsdk/           # Optional – auto-sourced if present
    occt/            # OCCT source checkout (git clone https://github.com/Open-Cascade-SAS/OCCT.git)
```

Place the OCCT sources under `third_party/occt/`. The build script creates `build-occt/` at the repo root and writes compiled artefacts to `packages/engine-occt/wasm/`.

## 3. Environment setup

1. Install Emscripten:

   ```bash
   cd third_party
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

   > Tip: add `source third_party/emsdk/emsdk_env.sh` to your shell profile so the toolchain is available in every session.

2. Optional environment overrides:

   | Variable                      | Default | Purpose                                                              |
   | ----------------------------- | ------- | -------------------------------------------------------------------- |
   | `OCCT_THREAD_POOL_SIZE`       | `4`     | Number of worker threads enabled in the threaded WebAssembly build.  |
   | `OCCT_INITIAL_MEMORY_MB`      | `512`   | Initial heap size for the web builds. Increase for large assemblies. |
   | `OCCT_MAX_MEMORY_MB`          | `2048`  | Upper bound for WebAssembly memory growth.                           |
   | `OCCT_NODE_INITIAL_MEMORY_MB` | `512`   | Initial heap size for the Node.js bundle.                            |

   Set these before invoking the build script if you need bespoke tuning.

## 4. Building

With the prerequisites in place:

```bash
# From the repo root
source third_party/emsdk/emsdk_env.sh   # or ensure emsdk is already on PATH
pnpm run build:wasm                     # wraps scripts/build-occt.sh
# or
scripts/build-occt.sh
```

The script will:

1. Configure OCCT for static compilation via `emcmake cmake`.
2. Build the required static libraries (`libTKernel.a`, `libTKMath.a`, …).
3. Emit three bundles under `packages/engine-occt/wasm/`:
   - `occt.js`, `occt.wasm`, `occt.worker.js` – threaded Web build (default in Studio).
   - `occt-core.js`, `occt-core.wasm` – single-thread Web fallback.
   - `occt-core.node.mjs`, `occt-core.node.wasm`, `occt-core.node.worker.js` – Node.js bundle used by the CLI.
4. Run the engine smoke tests to confirm bindings behave as expected.

## 5. Validation checklist

After the build completes:

- `ls packages/engine-occt/wasm/` shows the artefacts listed above.
- `pnpm smoke:cli` renders golden assemblies with real OCCT output.
- Studio dev server (`pnpm dev`) logs `OCCT initialized` instead of falling back to the mock worker.

If any of those checks fail, re-run the build with `OCCT_BUILD_DEBUG=1 scripts/build-occt.sh` (enables extra logging) and review the emitted warnings.

## 6. Troubleshooting

| Symptom                                          | Cause                      | Fix                                                                                                                                               |
| ------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Emscripten not found in PATH`                   | `emcc` unavailable         | `source emsdk_env.sh` or install emsdk under `third_party/emsdk`.                                                                                 |
| `libTK*.a missing`                               | OCCT build skipped modules | Ensure `third_party/occt/` is up to date and rerun the script; it compiles the Modeling, ModelingAlgorithms, and DataExchange modules by default. |
| Browser shows `SharedArrayBuffer` errors         | COOP/COEP headers missing  | Use `pnpm dev` (headers enabled) or configure your server for cross-origin isolation.                                                             |
| CLI reports `createOCCTModule is not a function` | Wrong artefact served      | Confirm `packages/engine-occt/wasm/occt.js` was updated and that build output is copied to deployment targets.                                    |

Still stuck? Open an issue with the console output from `scripts/build-occt.sh` and the contents of `packages/engine-occt/wasm/`.
