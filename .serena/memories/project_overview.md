# Sim4D Project Overview

## Purpose

Sim4D is a web-first, node-based parametric CAD application with exact B-Rep/NURBS geometry. Built by Aureo Labs (a MADFAM company), it provides Grasshopper-style visual parametrics with manufacturing-grade geometry that runs in the browser.

## Key Features

- **Exact geometry**: OCCT-class B-Rep/NURBS with real fillets, shells, drafts
- **Web-native**: No installs required, WASM workers, multi-threaded (COOP/COEP)
- **Visual + Scriptable**: Node graphs for designers, CLI/SDK for automation
- **Interoperable**: STEP/IGES today; 3DM/USD/glTF planned

## Current Status (MVP v0.1 - ~95% Complete)

✅ **Working**: Complete node editor with 30+ geometry nodes, real-time evaluation, CLI tools, mock geometry
🔄 **In Progress**: OCCT.wasm compilation for real geometry operations

## Architecture

- **Frontend**: React app with React Flow canvas
- **Engine**: TypeScript DAG orchestration with WASM workers
- **Geometry**: OCCT.wasm for B-Rep/NURBS operations
- **Renderer**: Three.js (WebGL2), WebGPU optional
- **Persistence**: .bflow.json format, IndexedDB mesh cache
