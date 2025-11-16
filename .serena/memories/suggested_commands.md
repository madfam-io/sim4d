# BrepFlow Suggested Commands

## Essential Development Commands

```bash
# Setup (one-time)
pnpm i                              # Install all dependencies
pnpm run build                      # Build all packages

# Daily Development
pnpm run dev                        # Start Studio + workers (http://localhost:5173)
pnpm run build                      # Build all packages with Turbo pipeline
pnpm run test                       # Run unit/integration tests (Vitest)
pnpm run lint                       # Run ESLint across all packages
pnpm run typecheck                  # TypeScript compilation check

# Testing
pnpm run test:e2e                   # Run Playwright E2E tests
pnpm run test:e2e:headed            # E2E tests with visible browser
pnpm run test:e2e:debug             # E2E tests in debug mode
pnpm run test:all                   # All tests (unit + E2E)

# Code Quality
pnpm run format                     # Format code with Prettier
pnpm lockfile:check                 # Verify lockfile consistency
pnpm lockfile:update                # Update lockfile

# WASM/Geometry (Optional)
pnpm run build:wasm                 # Compile OCCT.wasm (requires Emscripten)

# CLI Usage
pnpm --filter @brepflow/cli run build
node packages/cli/dist/index.js render examples/enclosure.bflow.json --export step,stl

# Cleanup
pnpm run clean                      # Clean all build artifacts
```

## Package-Specific Commands

```bash
# Work with specific packages
pnpm --filter @brepflow/studio run dev
pnpm --filter @brepflow/engine-core run build
pnpm --filter @brepflow/cli run test
```

## macOS-Specific Commands

```bash
# Standard Unix tools work on macOS
ls, cd, grep, find, git            # Standard commands
open http://localhost:5173          # Open browser on macOS
pbcopy < file.txt                   # Copy to clipboard
pbpaste > file.txt                  # Paste from clipboard
```
