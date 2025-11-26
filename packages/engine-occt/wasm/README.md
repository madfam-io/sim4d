# Sim4D WASM Modules

This directory contains WebAssembly modules for geometry processing and G-code generation.

## Contents

### OCCT Geometry Kernel (Existing)
- `occt-core.wasm` - Open CASCADE Technology geometry kernel
- `occt-worker.ts` - Geometry operations worker
- Handles: B-Rep/NURBS, Boolean operations, STEP/IGES export

### CuraEngine Slicer (New - In Development)
- `cura-engine.wasm` - CuraEngine slicer compiled to WASM
- `cura-engine.js` - JavaScript glue code (Emscripten generated)
- `cura-pre.js` - Pre-initialization configuration
- `cura-slicer-worker.ts` - Slicer worker implementation
- `cura-types.ts` - TypeScript type definitions

## Building WASM Modules

### CuraEngine Compilation

**Prerequisites**: Emscripten SDK installed

```bash
# Automated setup (recommended)
./scripts/setup-cura-wasm.sh

# Manual compilation
cd third_party/emsdk
source ./emsdk_env.sh
cd ../CuraEngine/build-wasm
emcmake cmake .. [options]
emmake make -j$(nproc)
```

See `docs/development/CURAENGINE_WASM_SETUP.md` for full guide.

### OCCT Compilation

```bash
pnpm run build:wasm
```

## File Sizes

| Module | Uncompressed | Compressed (Brotli) |
|--------|--------------|---------------------|
| OCCT | ~8 MB | ~2.5 MB |
| CuraEngine | ~15 MB | ~5 MB |

**Total**: ~23 MB uncompressed, ~7.5 MB compressed

## Worker Architecture

Both WASM modules run in dedicated Web Workers:

```
Main Thread
    ↓
Worker Pool
    ├─ OCCT Worker (geometry)
    └─ Cura Worker (slicing)
```

**Benefits**:
- Non-blocking UI (operations run in background)
- Isolated memory heaps (prevents interference)
- Concurrent processing (parallel operations)

## Usage Examples

### OCCT Geometry Worker

```typescript
import { GeometryWorker } from './occt-worker';

const worker = new GeometryWorker();
await worker.init();

// Create box
const box = await worker.invoke('MAKE_BOX', {
  width: 10,
  depth: 10,
  height: 10
});

// Export to STEP
const step = await worker.invoke('EXPORT_STEP', {
  shape: box
});
```

### Cura Slicer Worker

```typescript
import { CuraSlicerWorker } from './cura-slicer-worker';
import { SLICER_PROFILES } from './cura-types';

const worker = new CuraSlicerWorker();
await worker.init();

// Slice STL to G-code
const result = await worker.slice(stlData,
  SLICER_PROFILES['pla-standard'].settings
);

console.log(`Print time: ${result.metadata.printTime}s`);
console.log(`Filament: ${result.metadata.filamentUsed}mm`);
console.log(`G-code:\n${result.gcode}`);
```

## Memory Management

### Heap Limits

- **OCCT**: 512 MB maximum (geometry operations)
- **CuraEngine**: 512 MB maximum (slicing operations)
- **Browser limit**: ~2 GB total per tab

### Memory Growth

Both modules use `ALLOW_MEMORY_GROWTH=1` to dynamically allocate memory.

**Monitor usage**:
```typescript
const memory = performance.memory;
console.log(`Used: ${memory.usedJSHeapSize / 1024 / 1024} MB`);
```

## Performance Optimization

### Lazy Loading

Only load WASM when needed:

```typescript
let slicerWorker = null;

async function getSlicerWorker() {
  if (!slicerWorker) {
    slicerWorker = new CuraSlicerWorker();
    await slicerWorker.init();
  }
  return slicerWorker;
}
```

### Worker Pool

Reuse workers instead of creating new ones:

```typescript
const workerPool = {
  occt: new GeometryWorker(),
  cura: new CuraSlicerWorker()
};

await Promise.all([
  workerPool.occt.init(),
  workerPool.cura.init()
]);
```

### Caching

Cache compiled WASM modules:

```nginx
# Nginx
location /wasm/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  brotli_static on;
}
```

## Debugging

### Enable WASM Debugging

```typescript
// cura-pre.js
Module = {
  print: function(text) {
    console.log('[CuraEngine]', text);  // Enable stdout
  },
  printErr: function(text) {
    console.error('[CuraEngine]', text);  // Enable stderr
  }
};
```

### Inspect Virtual Filesystem

```typescript
const worker = new CuraSlicerWorker();
await worker.init();

// List files in virtual FS
console.log(worker.module.FS.readdir('/input'));
```

### Memory Profiling

Chrome DevTools:
1. Open DevTools → Memory
2. Take heap snapshot before operation
3. Run WASM operation
4. Take heap snapshot after
5. Compare snapshots

## Testing

Run WASM tests:

```bash
# Test CuraEngine compilation
./scripts/test-cura-wasm.sh

# Test OCCT integration
pnpm --filter @sim4d/engine-occt run test
```

## Deployment

### Production Build

1. Compile WASM modules (one-time):
   ```bash
   ./scripts/setup-cura-wasm.sh
   pnpm run build:wasm
   ```

2. Copy to public directory:
   ```bash
   cp packages/engine-occt/wasm/*.wasm apps/studio/public/wasm/
   cp packages/engine-occt/wasm/*.js apps/studio/public/wasm/
   ```

3. Enable compression:
   ```bash
   brotli -9 apps/studio/public/wasm/*.wasm
   ```

### CDN Deployment

Upload to CDN with proper headers:

```http
Content-Type: application/wasm
Content-Encoding: br
Cache-Control: public, max-age=31536000, immutable
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Browser Compatibility

| Browser | OCCT | CuraEngine | Notes |
|---------|------|------------|-------|
| Chrome 90+ | ✅ | ✅ | Full support |
| Firefox 89+ | ✅ | ✅ | Full support |
| Safari 15+ | ✅ | ✅ | Requires COOP/COEP |
| Edge 90+ | ✅ | ✅ | Chromium-based |

**Requirements**:
- WebAssembly support
- SharedArrayBuffer (for pthreads)
- Web Workers

## Troubleshooting

### "SharedArrayBuffer is not defined"

**Cause**: Missing COOP/COEP headers

**Solution**: Configure Vite dev server:
```typescript
// vite.config.ts
export default {
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
}
```

### "WASM module failed to load"

**Cause**: Incorrect file path or CORS issue

**Solution**: Check browser console for specific error, verify WASM path in `locateFile()`.

### "Out of memory" error

**Cause**: Model too large for browser heap

**Solution**:
1. Reduce model complexity
2. Increase `MAXIMUM_MEMORY` in WASM compilation
3. Implement streaming processing

## Related Documentation

- **G-code Generation Plan**: `docs/technical/GCODE_GENERATION_PLAN.md`
- **CuraEngine Setup**: `docs/development/CURAENGINE_WASM_SETUP.md`
- **OCCT Integration**: `packages/engine-occt/README.md`
- **Architecture**: `docs/technical/ARCHITECTURE.md`

## License

- **OCCT**: LGPL-2.1 (with linking exception)
- **CuraEngine**: LGPL-3.0
- **Sim4D glue code**: MPL-2.0

See individual LICENSE files in `third_party/` for details.
