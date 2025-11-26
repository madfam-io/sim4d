# Sim4D Setup Guide

This guide will help you get Sim4D up and running on your local machine.

## Prerequisites

- **Node.js** 20.11.x
- **pnpm** 8.6.x
- Modern browser with WebAssembly support
- (Optional) Emscripten SDK for building OCCT.wasm

## Quick Start

### 1. Install Dependencies

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Build OCCT.wasm (Optional - for geometry operations)

**Note**: The OCCT source needs to be downloaded manually first.

```bash
# Install Emscripten SDK
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cd ..

# Build OCCT.wasm
pnpm run build:wasm

# Validate the OCCT toolchain with CLI golden renders
pnpm smoke:cli

# (Optional) Allow mock fallback when OCCT is not available
BFP_SMOKE_ALLOW_MOCK=true pnpm smoke:cli
```

See [OCCT Environment Validation](./OCCT_VALIDATION.md) for the full checklist we use during release preparation.

### 3. Start Development Server

```bash
# Start the development server with COOP/COEP headers
pnpm run dev
```

The application will be available at http://localhost:5173

### 4. Build for Production

```bash
# Build all packages
pnpm run build
```

## Project Structure

```
sim4d/
├── apps/
│   ├── studio/          # React-based node editor application
│   └── marketing/       # Marketing website
├── packages/
│   ├── engine-core/     # DAG evaluation engine
│   ├── engine-occt/     # OCCT.wasm bindings
│   ├── viewport/        # Three.js 3D viewport
│   ├── nodes-core/      # Built-in node implementations
│   ├── types/           # Shared TypeScript types
│   ├── cli/             # Command-line interface
│   ├── sdk/             # Public SDK for custom nodes
│   ├── schemas/         # JSON schema definitions
│   ├── examples/        # Example graphs and fixtures
│   ├── collaboration/   # Real-time collaboration engine
│   ├── version-control/ # Graph version control
│   ├── constraint-solver/# Parametric constraint solving
│   ├── cloud-api/       # Cloud API client
│   └── cloud-services/  # Cloud service integrations
├── scripts/             # Build and utility scripts
├── tests/               # Test suites (unit, integration, E2E)
├── docs/                # Documentation
└── third_party/         # External dependencies (OCCT, etc.)
```

## Development Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm test         # Run tests
pnpm lint         # Run linting
pnpm typecheck    # Type checking
pnpm format       # Format code

# Building
pnpm build        # Build all packages
pnpm build:wasm   # Build OCCT.wasm

# Package-specific commands
pnpm build --filter @sim4d/engine-core    # Build specific package
pnpm test --filter @sim4d/nodes-core      # Test specific package

# Utilities
pnpm clean        # Clean build artifacts
```

## Experimental Cloud Features

Real-time cloud sync and project sharing remain experimental. They are disabled by default and must be explicitly enabled in your environment before instantiating the corresponding services:

```bash
# Enable experimental cloud sync APIs
export SIM4D_ENABLE_CLOUD_SYNC=true

# Enable experimental project sharing APIs
export SIM4D_ENABLE_PROJECT_SHARING=true
```

When running in a browser-only sandbox (for example inside Playwright or Storybook), the same flags can be toggled by assigning to `globalThis.__SIM4D_ENABLE_CLOUD_SYNC__` and `globalThis.__SIM4D_ENABLE_PROJECT_SHARING__` before your app bootstraps. If the flags are omitted, the constructors for the cloud managers throw immediately, preventing half-configured deployments from silently dropping user operations.

## Browser Requirements

For full functionality (WASM threads), your browser needs:

- SharedArrayBuffer support
- WebAssembly support
- WebGL2 support

The development server automatically sets the required COOP/COEP headers.

## IDE Setup

### VS Code (Recommended)

Install these extensions for the best development experience:

```bash
# Required extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# Recommended extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension formulahendry.auto-rename-tag
code --install-extension ms-vscode.vscode-json
```

#### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  }
}
```

## Environment Variables

Create `.env.local` in `apps/studio/`:

```bash
# Real OCCT runtime is required for Studio and CLI.
# Ensure OCCT_WASM_PATH points to the built wasm artifacts when customizing paths.

# API base URL (if using backend services)
VITE_API_BASE_URL=http://localhost:3001
```

## Troubleshooting

### Node Editor Issues (FIXED 2025-11-14)

**Double Node Placement** ✅ RESOLVED

- **Symptom**: Dropping a node from palette created 2 nodes instead of 1
- **Fix**: Removed redundant useEffect dependencies in App.tsx:176
- **Status**: Fixed and validated with 231/232 unit tests passing

**Vite Worker Import Parsing Error** ✅ RESOLVED

- **Symptom**: `[plugin:vite:worker-import-meta-url] Vite is unable to parse the worker options`
- **Fix**: Created `vite-plugin-wasm-worker-fix.ts` + added `/* @vite-ignore */` comments
- **Status**: Dev server now starts successfully in 335ms

### SharedArrayBuffer not available

- Ensure you're accessing via http://localhost:5173 (not file://)
- Check that your browser supports SharedArrayBuffer
- The dev server should set proper COOP/COEP headers automatically

### Build fails

- Ensure Node.js 20.11.x and pnpm 8.6.x are installed
- Try cleaning and reinstalling: `pnpm clean && pnpm install`
- Check for TypeScript errors: `pnpm typecheck`

### TypeScript errors

- Clear TypeScript cache: `rm -rf apps/studio/.vite`
- Rebuild type packages: `pnpm build --filter @sim4d/types`
- Check for circular dependencies

### Worker loading issues

- Verify worker.js is accessible at `/worker.js`
- Check browser console for CORS or CSP errors
- Ensure COOP/COEP headers are set correctly
- **Note**: Vite worker parsing issues with OCCT.wasm have been fixed (see above)

### OCCT.wasm build fails

- Ensure Emscripten SDK is properly installed and activated
- Check that OCCT source is downloaded to `third_party/occt/`
- Verify CMake and build tools are available

### Performance issues during development

- Use `pnpm dev --host` to bind to all interfaces
- Increase Node.js memory: `export NODE_OPTIONS="--max-old-space-size=4096"`
- Disable source maps in production builds

## Next Steps

1. Explore the node editor at http://localhost:5173
2. Create geometry using the node palette
3. View 3D results in the viewport
4. Export STEP/STL files (once OCCT.wasm is built)

For more information, see:

- [README.md](README.md) - Project overview
- [PRD.md](PRD.md) - Product requirements
- [SOFTWARE_SPEC.md](SOFTWARE_SPEC.md) - Technical specification
- [ROADMAP.md](../project/ROADMAP.md) - Development timeline
