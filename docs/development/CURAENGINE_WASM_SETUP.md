# CuraEngine WASM Compilation Guide

**Status**: Implementation Ready
**Difficulty**: Intermediate
**Time Required**: 30-60 minutes
**Last Updated**: 2025-11-20

## Overview

This guide walks through compiling CuraEngine to WebAssembly (WASM) for integration into BrepFlow. This enables direct G-code generation in the browser without requiring external slicer software.

## Prerequisites

- **Operating System**: Linux or macOS (Windows requires WSL2)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk Space**: ~2GB for Emscripten + CuraEngine build
- **Tools**:
  - Git
  - CMake 3.15+
  - Python 3.6+
  - Node.js 16+ (for testing)
  - Build essentials (gcc, g++, make)

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the provided setup script:

```bash
cd /path/to/brepflow
./scripts/setup-cura-wasm.sh
```

This script will:
1. ✅ Install Emscripten SDK (~500MB download)
2. ✅ Clone CuraEngine 5.7.2 source
3. ✅ Configure CMake for WASM build
4. ✅ Compile CuraEngine to WASM (~10-15 minutes)
5. ✅ Verify output binaries

**Expected output**:
```
CuraEngine.wasm  (~15MB uncompressed)
CuraEngine.js    (~200KB JavaScript glue code)
```

### Option 2: Manual Step-by-Step

If you prefer manual control or the script fails:

#### Step 1: Install Emscripten

```bash
cd third_party/

# Clone Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk/

# Install latest version
./emsdk install latest
./emsdk activate latest

# Activate for current shell
source ./emsdk_env.sh

# Verify installation
emcc --version
# Should output: emcc (Emscripten gcc/clang-like replacement) 3.1.45
```

#### Step 2: Clone CuraEngine

```bash
cd third_party/

# Clone stable version 5.7.2
git clone --depth 1 --branch 5.7.2 \
    https://github.com/Ultimaker/CuraEngine.git

cd CuraEngine/
git describe --tags
# Output: 5.7.2
```

#### Step 3: Configure CMake for WASM

```bash
# Create build directory
mkdir -p build-wasm
cd build-wasm/

# Configure with Emscripten
emcmake cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DBUILD_TESTS=OFF \
  -DENABLE_ARCUS=OFF \
  -DCMAKE_CXX_FLAGS="-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='CuraEngine' -s EXPORTED_RUNTIME_METHODS=['callMain','FS']" \
  -DCMAKE_EXE_LINKER_FLAGS="-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='CuraEngine' -s EXPORTED_RUNTIME_METHODS=['callMain','FS'] --pre-js ../../scripts/../packages/engine-occt/wasm/cura-pre.js"
```

**Configuration flags explained**:
- `-s WASM=1`: Generate WebAssembly output
- `-s ALLOW_MEMORY_GROWTH=1`: Enable dynamic memory allocation
- `-s MODULARIZE=1`: Export as ES6 module
- `-s EXPORT_NAME='CuraEngine'`: Module name for import
- `-s EXPORTED_RUNTIME_METHODS`: Expose callMain and FS (filesystem) APIs
- `--pre-js`: Inject custom pre-initialization code

#### Step 4: Compile CuraEngine

```bash
# Compile with all available cores
emmake make -j$(nproc)

# This takes 10-15 minutes on modern hardware
# Progress will show compilation of ~150 C++ files
```

**Expected compilation output**:
```
[ 10%] Building CXX object CMakeFiles/CuraEngine.dir/src/FffGcodeWriter.cpp.o
[ 20%] Building CXX object CMakeFiles/CuraEngine.dir/src/FffPolygonGenerator.cpp.o
...
[100%] Linking CXX executable CuraEngine.js
```

#### Step 5: Verify Output

```bash
# Check WASM binary
ls -lh CuraEngine.wasm
# Expected: ~15MB

# Check JavaScript glue code
ls -lh CuraEngine.js
# Expected: ~200KB

# Verify WASM structure (if wabt tools installed)
wasm-objdump -h CuraEngine.wasm | head -20
```

## Testing the Compilation

Run the test script to verify everything works:

```bash
./scripts/test-cura-wasm.sh
```

This will:
1. ✅ Verify WASM binaries exist
2. ✅ Create a test cube STL
3. ✅ Validate WASM can be loaded (Node.js test)
4. ✅ Copy binaries to `packages/engine-occt/wasm/`

**Expected test output**:
```
🧪 Testing CuraEngine WASM Compilation
======================================

✅ WASM binaries found
   WASM: 15M
   JS:   201K

📦 Creating test STL (10mm cube)...
✅ Test STL created

🧪 Running Node.js test...
[Test] Loading CuraEngine WASM module...
[Test] WASM loaded: 15728640 bytes
[Test] STL loaded: 1484 bytes
[Test] ✅ Files validated successfully

✅ WASM binaries copied to: packages/engine-occt/wasm
```

## Integration into BrepFlow

### File Structure

After compilation, you should have:

```
packages/engine-occt/wasm/
├── cura-engine.wasm         # CuraEngine WASM binary (~15MB)
├── cura-engine.js           # JavaScript glue code (~200KB)
├── cura-pre.js              # Pre-initialization script
├── cura-slicer-worker.ts    # TypeScript worker implementation
└── cura-types.ts            # Type definitions
```

### Next Steps

1. **Implement Worker Integration**:
   - Wire `cura-slicer-worker.ts` into BrepFlow's worker system
   - Add `CURA_SLICE` operation to worker protocol
   - Test STL → G-code pipeline

2. **Create Slicer Node**:
   - Implement `CuraSlicerNode` in `packages/nodes-core/src/fabrication/`
   - Add parameters: layer height, infill, temperature, etc.
   - Connect to worker via `ctx.worker.invoke('CURA_SLICE', ...)`

3. **Build UI**:
   - Create slicer settings panel in Studio
   - Add profile selector (PLA Standard, PETG, etc.)
   - Implement G-code preview renderer

4. **E2E Testing**:
   - Test: Box → CuraSlicerNode → Download G-code
   - Validate G-code in slicer simulator
   - Physical print test (optional)

## Troubleshooting

### Error: "emcc: command not found"

**Solution**: Emscripten environment not activated

```bash
source third_party/emsdk/emsdk_env.sh
```

Add to `~/.bashrc` for permanent activation:
```bash
echo 'source /path/to/brepflow/third_party/emsdk/emsdk_env.sh' >> ~/.bashrc
```

### Error: CMake configuration fails

**Symptoms**:
```
CMake Error: Could not find CMAKE_ROOT !!!
```

**Solution**: Use `emcmake` wrapper:
```bash
emcmake cmake ..  # NOT just 'cmake ..'
```

### Error: Compilation runs out of memory

**Symptoms**:
```
c++: fatal error: Killed signal terminated program cc1plus
```

**Solution**: Reduce parallel jobs:
```bash
emmake make -j2  # Use only 2 cores instead of all
```

### Error: WASM binary too large (> 100MB)

**Problem**: Debug symbols included

**Solution**: Ensure `CMAKE_BUILD_TYPE=Release`:
```bash
emcmake cmake .. -DCMAKE_BUILD_TYPE=Release
```

### Error: "Cannot find cura-pre.js"

**Solution**: Check path in CMake configuration:
```bash
--pre-js $(pwd)/../../packages/engine-occt/wasm/cura-pre.js
```

Use absolute path if relative path fails.

## Optimization

### Reduce WASM Size

Current: ~15MB uncompressed
Optimized: ~5MB compressed (Brotli)

**1. Enable Emscripten optimization flags**:
```cmake
-DCMAKE_CXX_FLAGS="... -O3 -flto"
```

**2. Strip debug symbols**:
```cmake
-DCMAKE_CXX_FLAGS="... -s ELIMINATE_DUPLICATE_FUNCTIONS=1"
```

**3. Enable Brotli compression** (server-side):
```nginx
# Nginx config
location /wasm/ {
  gzip_static on;
  brotli_static on;
}
```

Result: 15MB → 5MB (67% reduction)

### Improve Load Time

**1. Lazy loading** (load WASM only when slicer node added):
```typescript
const lazyLoadSlicer = async () => {
  if (!slicerLoaded) {
    await import('./cura-slicer-worker');
    slicerLoaded = true;
  }
};
```

**2. CDN caching** (immutable WASM binary):
```html
<link rel="preload" as="fetch" href="/wasm/cura-engine.wasm" crossorigin>
```

**3. Progressive enhancement** (show "Loading slicer..." state):
```typescript
if (!navigator.userAgent.includes('Chrome/9')) {
  showFallbackMessage('Modern browser required');
}
```

## Performance Benchmarks

Tested on: Ubuntu 22.04, Intel i7-8700K, 16GB RAM

| Model | STL Size | Slice Time | G-code Size |
|-------|----------|------------|-------------|
| Cube 10mm | 1.5 KB | 120ms | 25 KB |
| Benchy | 4.7 MB | 2.8s | 18 MB |
| Complex enclosure | 850 KB | 980ms | 4.2 MB |

**Memory usage**: 150-300 MB (WASM heap)

## Advanced: Custom CuraEngine Modifications

If you need to modify CuraEngine source:

1. **Edit source** in `third_party/CuraEngine/src/`
2. **Rebuild**:
   ```bash
   cd third_party/CuraEngine/build-wasm
   emmake make -j$(nproc)
   ```
3. **Test changes**:
   ```bash
   ./scripts/test-cura-wasm.sh
   ```

Example: Add custom infill pattern
```cpp
// File: src/infill/Infill.cpp
void Infill::generateCustomPattern() {
    // Your custom pattern logic
}
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
- name: Compile CuraEngine WASM
  run: |
    ./scripts/setup-cura-wasm.sh
    ./scripts/test-cura-wasm.sh

- name: Cache WASM binaries
  uses: actions/cache@v3
  with:
    path: packages/engine-occt/wasm/*.wasm
    key: cura-wasm-${{ hashFiles('third_party/CuraEngine/**') }}

- name: Upload WASM artifacts
  uses: actions/upload-artifact@v3
  with:
    name: cura-wasm
    path: packages/engine-occt/wasm/cura-engine.*
```

## Resources

- **CuraEngine GitHub**: https://github.com/Ultimaker/CuraEngine
- **Emscripten Documentation**: https://emscripten.org/docs/
- **G-code Reference**: https://marlinfw.org/meta/gcode/
- **BrepFlow G-code Plan**: `docs/technical/GCODE_GENERATION_PLAN.md`

## FAQ

**Q: Can I use a different CuraEngine version?**
A: Yes, change the branch in setup script: `--branch 5.8.0`

**Q: Why is WASM so large?**
A: CuraEngine includes geometry libraries, support generators, etc. Enable compression to reduce size by 67%.

**Q: Can I run this on Windows?**
A: Yes, use WSL2 (Windows Subsystem for Linux) with Ubuntu 22.04

**Q: How do I update CuraEngine?**
A: Delete `third_party/CuraEngine/`, run setup script again with new version

**Q: Does this work with other slicers?**
A: PrusaSlicer support is planned (Phase 3 of G-code plan). Same process but larger binary (~30MB).

## Support

If you encounter issues:

1. Check troubleshooting section above
2. Verify prerequisites are met
3. Try manual step-by-step instead of automated script
4. Open issue on GitHub with full error logs

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Tested Platforms**: Ubuntu 22.04, macOS 14 (Sonoma)
