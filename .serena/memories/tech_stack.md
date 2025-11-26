# Sim4D Tech Stack

## Languages & Frameworks

- **TypeScript**: Primary language (strict: false for gradual adoption)
- **React**: Frontend framework with JSX transform
- **Node.js**: ≥18.0.0 required
- **WebAssembly**: OCCT.wasm for geometry operations

## Build System & Tools

- **pnpm**: Package manager (≥8.0.0), workspace configuration
- **Turborepo**: Monorepo build orchestration with pipeline dependencies
- **Vite**: Build tool and dev server
- **Emscripten**: WASM compilation for OCCT

## Development Tools

- **ESLint**: Linting with TypeScript, React, and React Hooks plugins
- **Prettier**: Code formatting (single quotes, 2 spaces, 100 char width)
- **Vitest**: Testing framework with jsdom environment
- **Playwright**: E2E testing
- **TypeScript**: ES2022 target, bundler module resolution

## Key Dependencies

- **React Flow**: Node-based editor
- **Three.js**: 3D rendering (WebGL2/WebGPU)
- **OCCT**: Open CASCADE Technology for CAD operations
- **IndexedDB**: Client-side persistence

## Architecture Pattern

- Monorepo with apps/ and packages/ structure
- Worker-based geometry isolation
- Content-addressed caching with deterministic hashing
- DAG evaluation with dirty propagation
