#!/bin/bash
set -e

# CuraEngine WASM Compilation Setup Script
# This script sets up Emscripten and prepares CuraEngine for WASM compilation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
THIRD_PARTY="$PROJECT_ROOT/third_party"
EMSDK_DIR="$THIRD_PARTY/emsdk"
CURA_DIR="$THIRD_PARTY/CuraEngine"
CURA_BUILD_DIR="$CURA_DIR/build-wasm"

echo "🚀 CuraEngine WASM Compilation Setup"
echo "===================================="
echo ""
echo "Project Root: $PROJECT_ROOT"
echo "Third Party: $THIRD_PARTY"
echo ""

# Step 1: Install Emscripten SDK
echo "📦 Step 1: Installing Emscripten SDK..."
if [ ! -d "$EMSDK_DIR" ]; then
    echo "   Cloning emsdk..."
    cd "$THIRD_PARTY"
    git clone https://github.com/emscripten-core/emsdk.git
    cd "$EMSDK_DIR"

    echo "   Installing latest emsdk..."
    ./emsdk install latest
    ./emsdk activate latest

    echo "✅ Emscripten SDK installed successfully"
else
    echo "✅ Emscripten SDK already exists at $EMSDK_DIR"
fi

# Activate emsdk for this session
echo "   Activating Emscripten environment..."
source "$EMSDK_DIR/emsdk_env.sh"

# Verify installation
echo "   Verifying Emscripten installation..."
emcc --version
echo ""

# Step 2: Clone CuraEngine
echo "📦 Step 2: Cloning CuraEngine..."
if [ ! -d "$CURA_DIR" ]; then
    echo "   Cloning CuraEngine from GitHub..."
    cd "$THIRD_PARTY"

    # Clone main branch (latest stable code)
    # Note: CuraEngine uses 'main' branch, not version tags for releases
    git clone --depth 1 --branch main https://github.com/Ultimaker/CuraEngine.git

    echo "✅ CuraEngine cloned successfully"
else
    echo "✅ CuraEngine already exists at $CURA_DIR"
fi

# Step 3: Prepare CuraEngine for WASM build
echo "📦 Step 3: Preparing CuraEngine for WASM build..."
cd "$CURA_DIR"

# Check CuraEngine version
echo "   CuraEngine version:"
git describe --tags || echo "   (Version info not available)"
echo ""

# Create build directory
if [ ! -d "$CURA_BUILD_DIR" ]; then
    mkdir -p "$CURA_BUILD_DIR"
    echo "✅ Created build directory: $CURA_BUILD_DIR"
else
    echo "✅ Build directory exists: $CURA_BUILD_DIR"
fi

# Step 4: Configure CMake for WASM
echo "📦 Step 4: Configuring CMake for WASM build..."
cd "$CURA_BUILD_DIR"

# Configure with Emscripten
echo "   Running emcmake..."
emcmake cmake .. \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_TESTS=OFF \
    -DENABLE_ARCUS=OFF \
    -DCMAKE_CXX_FLAGS="-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='CuraEngine' -s EXPORTED_RUNTIME_METHODS=['callMain','FS']" \
    -DCMAKE_EXE_LINKER_FLAGS="-s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='CuraEngine' -s EXPORTED_RUNTIME_METHODS=['callMain','FS'] --pre-js $SCRIPT_DIR/../packages/engine-occt/wasm/cura-pre.js"

echo "✅ CMake configuration complete"
echo ""

# Step 5: Compile CuraEngine to WASM
echo "📦 Step 5: Compiling CuraEngine to WASM..."
echo "   This may take several minutes..."
echo ""

emmake make -j$(nproc)

echo "✅ CuraEngine WASM compilation complete!"
echo ""

# Step 6: Verify WASM output
echo "📦 Step 6: Verifying WASM output..."
if [ -f "$CURA_BUILD_DIR/CuraEngine.wasm" ]; then
    WASM_SIZE=$(du -h "$CURA_BUILD_DIR/CuraEngine.wasm" | cut -f1)
    echo "✅ CuraEngine.wasm created successfully ($WASM_SIZE)"
else
    echo "⚠️  Warning: CuraEngine.wasm not found at expected location"
    echo "   Searching for WASM files..."
    find "$CURA_BUILD_DIR" -name "*.wasm" -o -name "*.js" | grep -i cura || true
fi

if [ -f "$CURA_BUILD_DIR/CuraEngine.js" ]; then
    JS_SIZE=$(du -h "$CURA_BUILD_DIR/CuraEngine.js" | cut -f1)
    echo "✅ CuraEngine.js (glue code) created successfully ($JS_SIZE)"
else
    echo "⚠️  Warning: CuraEngine.js not found"
fi

echo ""
echo "🎉 CuraEngine WASM Setup Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Copy WASM binaries to packages/engine-occt/wasm/"
echo "2. Run: ./scripts/test-cura-wasm.sh"
echo "3. Integrate into BrepFlow node system"
echo ""
echo "Files created:"
echo "  - $CURA_BUILD_DIR/CuraEngine.wasm"
echo "  - $CURA_BUILD_DIR/CuraEngine.js"
echo ""
