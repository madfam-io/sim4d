# OCCT Asset Strategy (Phase 2)

_Last updated: 2025-09-22_

## Why node polyfill warnings are suppressed

Studio consumes the OCCT engine packages directly from source so that we can ship the production-ready browser mocks that guard shared-memory and filesystem access. Rollup still scans the published build outputs (for dependency analysis) and reports that built-in modules such as `fs`, `path`, and `url` are being externalised. These modules are immediately remapped to the mocks provided in `apps/studio/src/polyfills`, and the runtime never attempts to load the Node implementations. Because the warnings are noisy but intentional, `apps/studio/vite.config.ts` installs `sim4d-occt-warning-filter` to silence them while leaving a breadcrumb to this document. If the engine packages drop their Node imports in future we can remove the filter.

## Large OCCT WASM bundles

The OCCT geometry kernels weigh in at ~33 MB and ~13 MB per artefact. They currently ship as a single threaded bundle because we depend on the upstream release layout. Until we adopt a split/streaming loader we suppress the Rollup `FILE_SIZE` warning and log a pointer to this document so the decision stays visible in CI output. The near-term roadmap is:

1. Evaluate `wasm-split` and `wasm-opt --strip-debug --strip-producers` to shed dead sections.
2. Enable Brotli/Gzip pre-compression in the preview server once streaming fetch is wired up.
3. Update `scripts/build-occt.sh` to emit a dual-target build (threaded/worker + fallback) before re-enabling the default Rollup threshold.

## Follow-up

- Track implementation in Phase 2 issue "OCCT build stabilization".
- Once bundle size is under the default Rollup 500 KB limit the suppression plugin and warning hook should be removed.
- Document the release checklist update in `docs/build/OCCT_IMPLEMENTATION_COMPLETE.md` when the above is satisfied.
