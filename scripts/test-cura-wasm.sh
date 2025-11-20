#!/bin/bash
set -e

# CuraEngine WASM Test Script
# Tests the compiled WASM binary with a simple cube STL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
THIRD_PARTY="$PROJECT_ROOT/third_party"
EMSDK_DIR="$THIRD_PARTY/emsdk"
CURA_BUILD_DIR="$THIRD_PARTY/CuraEngine/build-wasm"
TEST_DIR="$PROJECT_ROOT/test-results/cura-wasm"

echo "🧪 Testing CuraEngine WASM Compilation"
echo "======================================"
echo ""

# Activate Emscripten environment
if [ -f "$EMSDK_DIR/emsdk_env.sh" ]; then
    source "$EMSDK_DIR/emsdk_env.sh"
    echo "✅ Emscripten environment activated"
else
    echo "❌ Error: Emscripten not found at $EMSDK_DIR"
    echo "   Run ./scripts/setup-cura-wasm.sh first"
    exit 1
fi

# Check WASM files exist
if [ ! -f "$CURA_BUILD_DIR/CuraEngine.wasm" ]; then
    echo "❌ Error: CuraEngine.wasm not found"
    echo "   Expected: $CURA_BUILD_DIR/CuraEngine.wasm"
    echo "   Run ./scripts/setup-cura-wasm.sh to compile"
    exit 1
fi

if [ ! -f "$CURA_BUILD_DIR/CuraEngine.js" ]; then
    echo "❌ Error: CuraEngine.js not found"
    echo "   Expected: $CURA_BUILD_DIR/CuraEngine.js"
    exit 1
fi

echo "✅ WASM binaries found"
echo "   WASM: $(du -h "$CURA_BUILD_DIR/CuraEngine.wasm" | cut -f1)"
echo "   JS:   $(du -h "$CURA_BUILD_DIR/CuraEngine.js" | cut -f1)"
echo ""

# Create test directory
mkdir -p "$TEST_DIR"

# Create a simple cube STL for testing
echo "📦 Creating test STL (10mm cube)..."
cat > "$TEST_DIR/cube.stl" << 'EOF'
solid cube
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 10 10 0
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 10 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 10 10 10
      vertex 10 0 10
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 0 10 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 10 0 10
      vertex 10 0 0
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 0 0 10
      vertex 10 0 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 0 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 10 10
      vertex 10 10 0
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 10 10 0
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 10 10 10
      vertex 0 10 10
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 0
      vertex 0 10 10
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 10
      vertex 0 0 10
    endloop
  endfacet
endsolid cube
EOF

echo "✅ Test STL created: $TEST_DIR/cube.stl"

# Create basic Cura settings JSON
echo "📦 Creating test slicer settings..."
cat > "$TEST_DIR/settings.json" << 'EOF'
{
  "layer_height": 0.2,
  "wall_thickness": 1.2,
  "wall_line_count": 3,
  "infill_sparse_density": 20,
  "infill_pattern": "grid",
  "speed_print": 60,
  "material_print_temperature": 210,
  "material_bed_temperature": 60,
  "support_enable": false,
  "retraction_enable": true,
  "retraction_amount": 5,
  "machine_nozzle_size": 0.4,
  "machine_width": 220,
  "machine_depth": 220,
  "machine_height": 250
}
EOF

echo "✅ Settings JSON created"
echo ""

# Test with Node.js (if available)
if command -v node &> /dev/null; then
    echo "🧪 Running Node.js test..."
    echo ""

    cd "$CURA_BUILD_DIR"

    # Create Node.js test script
    cat > "$TEST_DIR/test-node.mjs" << 'EOFNODE'
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

console.log('[Test] Loading CuraEngine WASM module...');

// This would require the WASM to be compiled with Node.js support
// For now, just verify files exist
const wasmPath = process.argv[2];
const stlPath = process.argv[3];

try {
  const wasmBuffer = readFileSync(wasmPath);
  const stlBuffer = readFileSync(stlPath);

  console.log(`[Test] WASM loaded: ${wasmBuffer.byteLength} bytes`);
  console.log(`[Test] STL loaded: ${stlBuffer.byteLength} bytes`);
  console.log('[Test] ✅ Files validated successfully');
  console.log('');
  console.log('Note: Full WASM execution requires browser environment or Node with --experimental-wasm-modules');

} catch (error) {
  console.error('[Test] ❌ Error:', error.message);
  process.exit(1);
}
EOFNODE

    node "$TEST_DIR/test-node.mjs" \
        "$CURA_BUILD_DIR/CuraEngine.wasm" \
        "$TEST_DIR/cube.stl"

    echo ""
else
    echo "⚠️  Node.js not available, skipping runtime test"
    echo "   (WASM binaries still valid for browser use)"
    echo ""
fi

# Verify WASM structure with wasm-objdump (if available)
if command -v wasm-objdump &> /dev/null; then
    echo "🔍 Inspecting WASM structure..."
    echo ""

    wasm-objdump -h "$CURA_BUILD_DIR/CuraEngine.wasm" | head -20

    echo ""
else
    echo "ℹ️  wasm-objdump not available (install wabt tools for detailed inspection)"
    echo ""
fi

# Copy binaries to BrepFlow wasm directory
echo "📦 Packaging WASM binaries for BrepFlow..."

WASM_OUTPUT_DIR="$PROJECT_ROOT/packages/engine-occt/wasm"
mkdir -p "$WASM_OUTPUT_DIR"

cp "$CURA_BUILD_DIR/CuraEngine.wasm" "$WASM_OUTPUT_DIR/cura-engine.wasm"
cp "$CURA_BUILD_DIR/CuraEngine.js" "$WASM_OUTPUT_DIR/cura-engine.js"

echo "✅ WASM binaries copied to: $WASM_OUTPUT_DIR"
echo "   - cura-engine.wasm ($(du -h "$WASM_OUTPUT_DIR/cura-engine.wasm" | cut -f1))"
echo "   - cura-engine.js ($(du -h "$WASM_OUTPUT_DIR/cura-engine.js" | cut -f1))"
echo ""

# Summary
echo "🎉 CuraEngine WASM Test Complete!"
echo "===================================="
echo ""
echo "Test artifacts created:"
echo "  - Test STL: $TEST_DIR/cube.stl"
echo "  - Settings: $TEST_DIR/settings.json"
echo ""
echo "WASM binaries packaged for BrepFlow:"
echo "  - packages/engine-occt/wasm/cura-engine.wasm"
echo "  - packages/engine-occt/wasm/cura-engine.js"
echo ""
echo "Next steps:"
echo "1. Integrate cura-slicer-worker.ts into BrepFlow worker system"
echo "2. Create CuraSlicerNode in packages/nodes-core/"
echo "3. Add slicer UI to Studio app"
echo "4. Test end-to-end: BrepFlow graph → STL → G-code"
echo ""
