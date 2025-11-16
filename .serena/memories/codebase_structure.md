# BrepFlow Codebase Structure

## Monorepo Layout

```
/brepflow
  /apps
    /studio            # React app: node editor + viewport
    /marketing         # Marketing website
  /packages
    /engine-core       # DAG evaluation, dirty-propagation, hashing, persistence
    /engine-occt       # Worker bindings to occt.wasm (C++/TS glue)
    /viewport          # Three.js/WebGL2 (+ WebGPU flag) renderer
    /nodes-core        # Built-in node set
    /sdk               # Public SDK for custom nodes
    /cli               # Headless runner (Node.js)
    /schemas           # JSON schema for .bflow.json
    /types             # Shared types
    /examples          # Example graphs + fixtures
    /collaboration     # Multi-user features
    /version-control   # Graph versioning
    /constraint-solver # Geometric constraints
  /third_party         # occt, openNURBS (phase 2)
  /scripts             # Build scripts (e.g., build-occt.sh)
  /docs                # Documentation
  /test                # Global test setup
  /tests               # Integration tests
```

## Key Package Dependencies

- **apps/studio** depends on: viewport, engine-core, nodes-core, types
- **engine-core** depends on: types, schemas
- **engine-occt** depends on: engine-core, types
- **nodes-core** depends on: engine-core, engine-occt, sdk, types
- **cli** depends on: engine-core, engine-occt, nodes-core

## Build Pipeline (Turbo)

1. **types** - Built first (foundational)
2. **schemas** - JSON schemas for validation
3. **engine-core** - Core evaluation engine
4. **engine-occt** - WASM geometry bindings
5. **sdk** - Public API for custom nodes
6. **nodes-core** - Built-in node implementations
7. **viewport** - 3D rendering engine
8. **cli** - Command-line interface
9. **apps/studio** - Main React application

## Configuration Files

- **Root**: package.json, turbo.json, tsconfig.json, .eslintrc.json
- **TypeScript**: tsconfig.base.json with path aliases
- **Testing**: vitest.config.ts, playwright.config.ts
- **Formatting**: .prettierrc
- **Workspace**: pnpm-workspace.yaml
