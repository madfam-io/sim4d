#!/bin/bash

# Sim4D OCCT build orchestrator
# Produces threaded web bundles and Node.js bundles from the same OCCT toolchain

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
THIRD_PARTY_DIR="$PROJECT_ROOT/third_party"
BUILD_DIR="$PROJECT_ROOT/build-occt"
OUTPUT_DIR="$PROJECT_ROOT/packages/engine-occt/wasm"
BINDINGS_DIR="$PROJECT_ROOT/packages/engine-occt/src"

WEB_BASENAME="occt"
CORE_BASENAME="occt-core"
NODE_BASENAME="occt-core.node"

THREAD_POOL_SIZE="${OCCT_THREAD_POOL_SIZE:-4}"
INITIAL_MEMORY_MB="${OCCT_INITIAL_MEMORY_MB:-512}"
NODE_INITIAL_MEMORY_MB="${OCCT_NODE_INITIAL_MEMORY_MB:-512}"
MAX_MEMORY_MB="${OCCT_MAX_MEMORY_MB:-2048}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
  echo -e "$1$2${NC}"
}

detect_cpu_count() {
  if command -v nproc >/dev/null 2>&1; then
    nproc
  else
    sysctl -n hw.logicalcpu 2>/dev/null || echo 4
  fi
}

ensure_emscripten() {
  if command -v emcc >/dev/null 2>&1; then
    return
  fi

  log "$YELLOW" "Emscripten not found in PATH, attempting to source emsdk..."
  if [ -f "$THIRD_PARTY_DIR/emsdk/emsdk_env.sh" ]; then
    # shellcheck disable=SC1090
    source "$THIRD_PARTY_DIR/emsdk/emsdk_env.sh"
    log "$GREEN" "✓ Emscripten toolchain activated"
  else
    log "$RED" "✗ Emscripten SDK not available. Install emsdk under third_party/emsdk."
    exit 1
  fi
}

configure_occt() {
  local occt_dir="$THIRD_PARTY_DIR/occt"

  if [ ! -d "$occt_dir" ]; then
    log "$RED" "✗ OCCT source tree not found at $occt_dir"
    exit 1
  fi

  mkdir -p "$BUILD_DIR"
  pushd "$BUILD_DIR" >/dev/null

  log "$YELLOW" "Configuring OCCT ($occt_dir) for Emscripten..."
  emcmake cmake "$occt_dir" \
    -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_LIBRARY_TYPE=Static \
    -DBUILD_MODULE_ApplicationFramework=OFF \
    -DBUILD_MODULE_DataExchange=ON \
    -DBUILD_MODULE_Draw=OFF \
    -DBUILD_MODULE_FoundationClasses=ON \
    -DBUILD_MODULE_ModelingAlgorithms=ON \
    -DBUILD_MODULE_ModelingData=ON \
    -DBUILD_MODULE_Visualization=OFF \
    -DUSE_FREETYPE=OFF \
    -DUSE_TCL=OFF \
    -DUSE_TK=OFF \
    -DUSE_VTK=OFF \
    -DUSE_FREEIMAGE=OFF \
    -DUSE_RAPIDJSON=OFF \
    -DUSE_TBB=OFF \
    -DUSE_OPENGL=OFF \
    -DUSE_GLES2=OFF \
    -DCMAKE_CXX_FLAGS="-O3 -fPIC -pthread -matomics -mbulk-memory" \
    -DCMAKE_C_FLAGS="-O3 -fPIC -pthread -matomics -mbulk-memory" \
    || { log "$RED" "✗ CMake configuration failed"; exit 1; }

  log "$YELLOW" "Building OCCT static libraries (this will take a while)..."
  local jobs
  jobs="$(detect_cpu_count)"
  log "$CYAN" "Using $jobs parallel jobs"
  if ! emmake make -j"$jobs"; then
    log "$YELLOW" "Parallel build failed, retrying single-threaded"
    emmake make -j1 || { log "$RED" "✗ OCCT compilation failed"; exit 1; }
  fi

  popd >/dev/null
  log "$GREEN" "✓ OCCT static libraries ready"
}

collect_libraries() {
  local libs=(
    TKernel TKMath TKG2d TKG3d TKGeomBase TKBRep TKGeomAlgo TKTopAlgo TKTopOpe TKPrim
    TKMesh TKBO TKBool TKFillet TKOffset TKShHealing TKXSBase TKDESTEP TKDEIGES
  )

  OCCT_LIBS=()
  log "$YELLOW" "Linking with OCCT archives:"
  for lib in "${libs[@]}"; do
    local archive="$BUILD_DIR/lin32/clang/lib/lib${lib}.a"
    if [ ! -f "$archive" ]; then
      archive="$BUILD_DIR/lib/lib${lib}.a"
    fi

    if [ -f "$archive" ]; then
      log "$CYAN" "  • lib${lib}.a"
      OCCT_LIBS+=("$archive")
    else
      log "$YELLOW" "  • lib${lib}.a (missing)"
    fi
  done

  if [ ${#OCCT_LIBS[@]} -eq 0 ]; then
    log "$RED" "✗ No OCCT archives found. Check the build output under $BUILD_DIR."
    exit 1
  fi
}

compile_variant() {
  local label="$1"
  local cpp_source="$2"
  local output_basename="$3"
  shift 3
  local extra_flags=("$@")

  local output_path="$OUTPUT_DIR/$output_basename"
  rm -f "$output_path" "$output_path".wasm "$output_path".worker.js

  log "$YELLOW" "Compiling $label → $output_basename"
  em++ "$BINDINGS_DIR/$cpp_source" \
    -I"$BUILD_DIR/include/opencascade" \
    "${OCCT_LIBS[@]}" \
    -o "$output_path" \
    -s WASM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ASSERTIONS=1 \
    -s SAFE_HEAP=0 \
    -s STACK_OVERFLOW_CHECK=1 \
    -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
    -s NO_DISABLE_EXCEPTION_CATCHING \
    -lembind \
    -O3 \
    --bind \
    "${extra_flags[@]}" \
    || { log "$RED" "✗ Failed to compile $label"; exit 1; }

  log "$GREEN" "✓ $label ready"
}

post_build_summary() {
  log "$GREEN" "\nGenerated artifacts:" 
  ls -lh "$OUTPUT_DIR" | sed 's/^/  /'
  log "$GREEN" "\nBuild complete."
  echo "Artifacts include:"
  echo "  - ${WEB_BASENAME}.js/.wasm/.worker.js (threaded web bundle)"
  echo "  - ${CORE_BASENAME}.js/.wasm (single-thread web fallback)"
  echo "  - ${NODE_BASENAME}.mjs/.wasm/.worker.js (Node.js bundle)"
  echo
  echo "Next steps:"
  echo "  1. Serve /wasm/${WEB_BASENAME}*.{js,wasm} with COOP/COEP enabled."
  echo "  2. Ensure backend build scripts publish the Node bundle."
  echo "  3. Review the smoke test output above and surface regressions promptly."
}

run_node_smoke_tests() {
  log "$YELLOW" "\nRunning @sim4d/engine-occt smoke tests..."
  if pnpm --filter @sim4d/engine-occt test node-occt-smoke; then
    log "$GREEN" "✓ node-occt smoke suite passed"
  else
    log "$RED" "✗ node-occt smoke suite failed"
    exit 1
  fi
}

main() {
  log "$GREEN" "Sim4D OCCT build orchestrator"
  echo "================================"

  mkdir -p "$OUTPUT_DIR"

  ensure_emscripten
  log "$GREEN" "✓ Using $(emcc --version | head -n1)"

  configure_occt
  collect_libraries

  local base_js_flags=(
    -s EXPORT_ES6=1
    -s MODULARIZE=1
    -s FILESYSTEM=0
  )

  compile_variant \
    "threaded web OCCT" \
    "occt-full.cpp" \
    "${WEB_BASENAME}.js" \
    "${base_js_flags[@]}" \
    -pthread \
    -s USE_PTHREADS=1 \
    -s PTHREAD_POOL_SIZE="$THREAD_POOL_SIZE" \
    -s EXPORT_NAME='createOCCTModule' \
    -s ENVIRONMENT='web,worker' \
    -s INITIAL_MEMORY=${INITIAL_MEMORY_MB}MB \
    -s MAXIMUM_MEMORY=${MAX_MEMORY_MB}MB \
    -s EXPORTED_RUNTIME_METHODS='["addFunction","removeFunction","UTF8ToString","stringToUTF8","lengthBytesUTF8"]' \
    -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$Browser","$GL","$FS"]' \
    -s ALLOW_TABLE_GROWTH=1

  compile_variant \
    "optimized web OCCT" \
    "occt-core.cpp" \
    "${CORE_BASENAME}.js" \
    "${base_js_flags[@]}" \
    -s EXPORT_NAME='createOCCTCoreModule' \
    -s ENVIRONMENT='web,worker' \
    -s INITIAL_MEMORY=${INITIAL_MEMORY_MB}MB \
    -s MAXIMUM_MEMORY=${MAX_MEMORY_MB}MB

  compile_variant \
    "Node.js OCCT" \
    "occt-core.cpp" \
    "${NODE_BASENAME}.mjs" \
    "${base_js_flags[@]}" \
    -pthread \
    -s USE_PTHREADS=1 \
    -s PTHREAD_POOL_SIZE="$THREAD_POOL_SIZE" \
    -s EXPORT_NAME='createOCCTNodeModule' \
    -s ENVIRONMENT='node,worker' \
    -s INITIAL_MEMORY=${NODE_INITIAL_MEMORY_MB}MB \
    -s MAXIMUM_MEMORY=${MAX_MEMORY_MB}MB \
    -s EXPORTED_RUNTIME_METHODS='["addFunction","removeFunction","UTF8ToString","stringToUTF8","lengthBytesUTF8"]' \
    -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE='["$Browser","$GL","$FS"]' \
    -s ALLOW_TABLE_GROWTH=1

  run_node_smoke_tests
  post_build_summary
}

main "$@"
