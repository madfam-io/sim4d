# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Sample projects button in welcome screen onboarding
- Template gallery accessible from onboarding flow

## [0.1.0] - 2024-11-27

### Added

- **Sim4D Studio** - Node-based parametric CAD platform
- Visual node editor with ReactFlow integration
- OCCT WASM geometry kernel for Boolean operations
- Real-time 3D viewport with Three.js rendering
- Template gallery with 6 example projects
- Onboarding system with skill-level selection
- Interactive playgrounds for learning
- Multi-viewport layout system
- Export support: STEP, STL, IGES, native .bflow.json
- Import support: STEP, IGES, STL, OBJ
- Undo/redo history with 50-step limit
- Auto-save to browser localStorage
- Keyboard shortcuts for common operations
- Session collaboration infrastructure

### Node Types

- Primitives: Box, Cylinder, Sphere, Cone, Torus
- Boolean: Union, Subtract, Intersect
- Transforms: Move, Rotate, Scale, Mirror
- Features: Fillet, Chamfer, Shell
- Patterns: Linear Array, Circular Array
- Sketches: Polygon, Extrude, Revolve

### Technical

- Turborepo monorepo architecture
- Vite + React 18 with TypeScript
- Zustand state management
- OCCT WASM with Web Workers
- 99.6% test pass rate
- Comprehensive error boundaries
