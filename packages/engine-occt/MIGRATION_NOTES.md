# sim4d to geom-core Migration Notes

## Overview

This document describes the migration path from sim4d's `engine-occt` package to the unified `@madfam/geom-core` package.

## Migration Status

**Phase 1: geom-core feature completion** - COMPLETED
- Added I/O operations (STEP/STL/IGES import/export)
- Added assembly operations (mates, patterns)
- Added 2D primitives (line, circle, rectangle, arc, polygon, ellipse, point)
- Added draft feature
- Added center of mass calculation

**Phase 2: Dependency setup** - COMPLETED
- Added `@madfam/geom-core` as workspace dependency
- Configured pnpm workspace linking

**Phase 3: Adapter layer** - COMPLETED
- Created `GeomCoreAdapter` to bridge API differences
- Created `GeomCoreWorkerPool` for multi-threaded operations
- Created `HybridGeometryAPI` for gradual migration with A/B testing
- Operation name mapping (MAKE_BOX → makeBox)
- Result format conversion

**Phase 4: Integration** - IN PROGRESS
- `geometry-service.production.ts` updated to use `IntegratedGeometryAPI`
- HybridGeometryAPI exports need DTS resolution fix before full integration

## Architecture

### Hybrid API Pattern

The `HybridGeometryAPI` enables gradual migration by routing operations to either:
- **Legacy backend**: sim4d's existing `IntegratedGeometryAPI`
- **geom-core backend**: New `GeomCoreAdapter` wrapping `@madfam/geom-core`

Configuration options:
```typescript
interface HybridAPIConfig {
  defaultBackend: 'legacy' | 'geom-core' | 'auto';
  enableGeomCore: boolean;
  enableLegacy: boolean;
  geomCoreOperations: string[];  // Force these ops to geom-core
  legacyOperations: string[];     // Force these ops to legacy
  enableComparison: boolean;      // A/B testing mode
  comparisonSampleRate: number;   // Sample rate for comparison
}
```

### Operation Mapping

| sim4d Operation | geom-core Method |
|-----------------|------------------|
| MAKE_BOX | makeBox |
| MAKE_SPHERE | makeSphere |
| MAKE_CYLINDER | makeCylinder |
| BOOLEAN_UNION | booleanUnion |
| BOOLEAN_SUBTRACT | booleanSubtract |
| MAKE_EXTRUDE | extrude |
| TESSELLATE | tessellate |
| ... | ... |

## Known Issues

### DTS Export Resolution
The `HybridGeometryAPI` and related types are not being exported in the main `index.d.ts` due to TypeScript compilation errors in the dependency chain. 

**Workaround**: Import from the hybrid subpath:
```typescript
import { HybridGeometryAPI } from '@sim4d/engine-occt/hybrid';
```

Or use `IntegratedGeometryAPI` directly until resolved.

### Type Compatibility
The OCCT WASM module types between sim4d and geom-core are structurally identical but nominally different. Use type assertions when passing the OCCT module between systems.

## Next Steps

1. Fix pre-existing TypeScript errors in engine-occt bindings
2. Resolve DTS export for HybridGeometryAPI
3. Enable geom-core routing for stable operations
4. Add performance comparison metrics
5. Gradually migrate operations to geom-core backend

## Testing

Run engine-occt tests:
```bash
cd packages/engine-occt
pnpm test
```

Verify hybrid API build:
```bash
pnpm exec tsup src/index.ts src/hybrid-geometry-api.ts --format esm --dts
```

## Files Modified

- `packages/engine-occt/package.json` - Added @madfam/geom-core dependency
- `packages/engine-occt/src/geom-core-adapter.ts` - New adapter layer
- `packages/engine-occt/src/geom-core-worker-bridge.ts` - Worker pool integration
- `packages/engine-occt/src/hybrid-geometry-api.ts` - Hybrid routing API
- `packages/engine-occt/src/index.ts` - Re-exports
- `packages/engine-occt/tsup.config.ts` - Multi-entry build
- `apps/studio/src/services/geometry-service.production.ts` - Updated service
