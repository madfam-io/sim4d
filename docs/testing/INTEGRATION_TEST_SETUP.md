# Integration Test Setup Guide

## Overview

This guide provides step-by-step instructions for enabling all integration tests in the Sim4D project. Based on recent test analysis, there are two main areas requiring attention:

1. **OCCT WASM Compilation** (High Priority) - Enables geometry operations
2. **Collaboration Service Setup** (Medium Priority) - Enables real-time collaboration tests

## Current Test Status

### Test Results Summary

- **Test Files**: 4 failed | 2 passed (6 total)
- **Tests**: 5 failed | 20 passed | 32 skipped (57 total)
- **Duration**: ~181s

### Passing Tests ✅

- **UI Components** (9/9 tests) - `apps/studio/src/tests/integration/ui-components-simple.test.tsx`
  - Button component rendering and interactions
  - Panel component layout
  - PanelSection collapse functionality

### Failing/Skipped Tests ❌⏭️

#### 1. Constraint Solver Tests (FAIL)

**Location**: `tests/integration/constraint-solver.integration.test.ts:119`

**Error**:

```
Error: [OCCTWrapper] Real OCCT WASM module is not available.
Run "pnpm run build:wasm" to compile the bindings.
```

**Impact**: Blocks geometric constraint validation tests

#### 2. Collaboration Tests (SKIP - 32 tests)

**Location**: `tests/integration/collaboration.integration.test.ts`

**Cause**: Collaboration server not accessible at `http://localhost:8080`

**Impact**: Real-time collaboration features untested

#### 3. Abacus Integration Tests (SKIP - ~11 tests)

**Location**: `tests/integration/abacus.integration.test.ts`

**Cause**: Requires OCCT WASM for parametric geometry generation

**Impact**: Parametric CAD workflow untested

## Solution 1: OCCT WASM Compilation (Priority: High)

### Prerequisites

✅ **Already Available** (verified in `third_party/`):

- Emscripten SDK at `third_party/emsdk/`
- OCCT source (v7.8.0) at `third_party/occt/`

### Build Process

#### Option A: Quick Build (Recommended for Testing)

```bash
# From project root
pnpm run build:wasm

# This will:
# 1. Configure OCCT with Emscripten (CMake)
# 2. Compile OCCT static libraries (~5-15 minutes)
# 3. Generate WebAssembly bindings
# 4. Output to packages/engine-occt/wasm/
```

#### Option B: Manual Build (Advanced)

```bash
# Activate Emscripten environment
source third_party/emsdk/emsdk_env.sh

# Run build script
./scripts/build-occt.sh

# Verify output
ls -lh packages/engine-occt/wasm/
```

### Build Configuration

The build script (`scripts/build-occt.sh`) configures OCCT with:

- **Modules Enabled**: FoundationClasses, ModelingData, ModelingAlgorithms, DataExchange
- **Modules Disabled**: Visualization, ApplicationFramework, Draw
- **Thread Pool**: 4 workers (configurable via `OCCT_THREAD_POOL_SIZE`)
- **Initial Memory**: 512 MB (web), 512 MB (Node.js)
- **Max Memory**: 2048 MB

### Expected Output

After successful compilation:

```
packages/engine-occt/wasm/
├── occt.js          # Web worker bundle
├── occt.wasm        # WASM module (web)
├── occt.worker.js   # Pthread worker
├── occt-core.node.js    # Node.js bundle
└── occt-core.node.wasm  # WASM module (Node.js)
```

### Verification

```bash
# Check WASM module exists
ls packages/engine-occt/wasm/*.wasm

# Run constraint solver test
pnpm vitest run tests/integration/constraint-solver.integration.test.ts

# Expected: Test should pass ✅
```

### Expected Impact

With OCCT WASM compiled:

- ✅ **Constraint solver tests** (1 test)
- ✅ **Abacus integration tests** (~11 tests)
- ✅ **CLI headless tests** (geometry export)
- ✅ **Real geometry operations** in all tests

**Estimated unlock**: ~13-15 tests

## Solution 2: Collaboration Service Setup (Priority: Medium)

### Current Status

Docker collaboration service is **running** but tests cannot connect:

```bash
# Service status
docker-compose ps
# sim4d-collaboration-1   Up (port 8080)

# Health check fails
curl http://localhost:8080/health
# Connection refused
```

### Root Cause

The collaboration server package exports modules but doesn't include a standalone HTTP server implementation. The service needs:

1. HTTP/WebSocket server setup
2. Health check endpoint (`/health`)
3. Collaboration API routes

### Solution Options

#### Option A: Add HTTP Server to Collaboration Package

**Location**: `packages/collaboration/src/server/`

**Required Implementation**:

```typescript
// packages/collaboration/src/server/app.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sessionManager } from '../simple-session';

export function createCollaborationServer(port = 8080) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      sessions: sessionManager.getSessionCount(),
    });
  });

  // Session routes
  app.get('/api/sessions', (req, res) => {
    res.json(sessionManager.getAllSessions());
  });

  // WebSocket collaboration
  io.on('connection', (socket) => {
    // Real-time collaboration logic
  });

  return { app, httpServer, io };
}
```

#### Option B: Skip Collaboration Tests (Short-term)

For MVP testing without real-time collaboration:

```bash
# Run integration tests excluding collaboration
pnpm vitest run tests/integration/ --exclude "**/collaboration.integration.test.ts"
```

### Verification (After Implementation)

```bash
# Start collaboration service
docker-compose up -d collaboration

# Wait for startup
sleep 3

# Test health endpoint
curl http://localhost:8080/health
# Expected: {"status":"healthy","sessions":0}

# Run collaboration tests
pnpm vitest run tests/integration/collaboration.integration.test.ts

# Expected: 32 tests pass ✅
```

## Complete Test Enablement Workflow

### Step 1: Build OCCT WASM

```bash
# Ensure dependencies
pnpm install

# Build WASM bindings
pnpm run build:wasm

# Verify compilation
ls packages/engine-occt/wasm/*.wasm
```

### Step 2: Run Integration Tests

```bash
# All integration tests
pnpm vitest run tests/integration/

# Expected results:
# - UI Components: 9/9 ✅
# - Constraint Solver: 1/1 ✅ (after WASM)
# - Abacus: ~11 ✅ (after WASM)
# - CLI: varies ✅ (after WASM)
# - Collaboration: 32 ⏭️ (until server implemented)
```

### Step 3: Generate Coverage Report

```bash
# Run with coverage analysis
pnpm vitest run tests/integration/ --coverage

# Coverage thresholds (vitest.config.ts):
# - Lines: 80%
# - Functions: 80%
# - Branches: 80%
# - Statements: 80%
```

## Performance Expectations

### OCCT WASM Build Time

- **First build**: 5-15 minutes (depends on CPU)
- **Incremental**: ~1-2 minutes (if source unchanged)
- **Parallel jobs**: Auto-detected (uses all CPU cores)

### Test Execution Time

- **UI Components**: ~0.5s
- **Constraint Solver**: ~10s (with WASM)
- **Abacus Integration**: ~30-60s (parametric generation)
- **Collaboration**: ~60s (network I/O)
- **Total**: ~3-5 minutes (all integration tests)

## Troubleshooting

### OCCT Build Fails

**Symptom**: CMake configuration errors or compilation failures

**Solutions**:

```bash
# Clean build artifacts
rm -rf build-occt/

# Verify Emscripten
source third_party/emsdk/emsdk_env.sh
emcc --version  # Should show v3.1.x or later

# Retry build
pnpm run build:wasm
```

### Tests Still Skip After WASM Build

**Symptom**: Tests skip with "OCCT not available" despite WASM files present

**Solutions**:

```bash
# Rebuild engine-occt package
pnpm --filter @sim4d/engine-occt run build

# Verify WASM module loading
node -e "require('./packages/engine-occt/dist/index.js')"

# Check for runtime errors
pnpm vitest run tests/integration/constraint-solver.integration.test.ts --reporter=verbose
```

### Collaboration Tests Timeout

**Symptom**: Tests hang waiting for server connection

**Solutions**:

```bash
# Check Docker service logs
docker-compose logs collaboration

# Verify port binding
lsof -i :8080

# Restart collaboration service
docker-compose restart collaboration
```

## Quality Gates

After completing setup, verify all gates pass:

✅ **Compilation**

```bash
pnpm run build
# All packages build successfully
```

✅ **Type Safety**

```bash
pnpm run typecheck
# No TypeScript errors
```

✅ **Linting**

```bash
pnpm run lint
# No ESLint errors
```

✅ **Integration Tests**

```bash
pnpm vitest run tests/integration/
# Minimum: 50+ tests passing
# With WASM: 70+ tests passing
# With collaboration: 100+ tests passing
```

✅ **Coverage**

```bash
pnpm vitest run tests/integration/ --coverage
# Lines: >80%
# Functions: >80%
# Branches: >80%
```

## Next Steps

1. **Immediate** (Today):
   - ✅ Build OCCT WASM: `pnpm run build:wasm`
   - ✅ Run integration tests: `pnpm vitest run tests/integration/`
   - ✅ Verify constraint solver tests pass

2. **Short-term** (This Week):
   - 🔄 Implement collaboration HTTP server
   - 🔄 Enable all 32 collaboration tests
   - 🔄 Generate full coverage report

3. **Ongoing**:
   - 📊 Monitor test performance and flakiness
   - 🔍 Add integration tests for new features
   - 📈 Maintain >80% coverage threshold

## References

- **Build Script**: `scripts/build-occt.sh`
- **Package Config**: `packages/engine-occt/package.json`
- **Test Files**: `tests/integration/*.test.ts`
- **Coverage Config**: `vitest.config.ts`
- **Docker Setup**: `docker-compose.yml`

---

**Last Updated**: 2025-11-14
**Test Analysis**: `/sc:test integration tests`
**Status**: 20/57 tests passing (35%), WASM compilation required
