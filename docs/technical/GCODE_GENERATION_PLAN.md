# G-code Generation & Slicer Integration Plan

**Status**: Planning Phase
**Priority**: High
**Target**: Enable direct G-code export for 3D printing from BrepFlow Studio
**Tracking Issue**: TBD

## Executive Summary

This document outlines the architecture and implementation plan for integrating open-source slicing engines into BrepFlow, enabling users to generate G-code directly from parametric CAD models without requiring external slicer software.

**Key Goals**:
1. ✅ Support multiple open-source slicers (PrusaSlicer, CuraEngine)
2. ✅ Provide slicer-specific configuration nodes
3. ✅ Generate production-ready G-code for FDM printers
4. ✅ Enable multi-material/multi-color workflows
5. ✅ Maintain BrepFlow's web-first architecture

---

## Current State Analysis

### ✅ What Exists
- **STL Export**: Fully functional (`packages/nodes-core/src/io.ts:108-153`)
- **Placeholder Nodes**: Fabrication nodes exist but lack implementations
  - Location: `packages/nodes-core/src/nodes/generated/fabrication/3d-printing/`
  - Examples: `non-planar-slicing.ts`, `gcode-post-processor.ts`
- **OCCT Geometry Kernel**: Provides manufacturing-grade B-Rep/NURBS geometry
- **Node Registry System**: Extensible architecture for adding new node types

### ❌ What's Missing
- **Actual Slicer Integration**: Placeholder nodes have no real implementations
- **WASM Slicer Binaries**: No compiled slicer engines for browser execution
- **Slicer Configuration UI**: No parameter controls for print settings
- **G-code Validation**: No verification that generated G-code is printer-compatible
- **Multi-Material Support**: No color/material assignment workflow

---

## Architecture Design

### Option 1: WASM Slicer Integration (Recommended)

Compile open-source slicers to WebAssembly for in-browser execution.

**Advantages**:
- ✅ No backend required (web-first)
- ✅ Privacy-preserving (local processing)
- ✅ Fast iteration (no network latency)
- ✅ Works offline

**Challenges**:
- ⚠️ WASM compilation complexity (Emscripten)
- ⚠️ Binary size (CuraEngine ~15MB, PrusaSlicer ~30MB)
- ⚠️ Memory constraints (browser heap limits)

**Technical Stack**:
```
BrepFlow Graph → STL Generation → WASM Slicer → G-code Output
     ↓               ↓                  ↓              ↓
  Parametric      OCCT.wasm        CuraEngine.wasm   Download
  Nodes           Worker           Worker            or Upload
```

### Option 2: Server-Side Slicer (Fallback)

Run slicers on a backend API for complex models.

**Advantages**:
- ✅ Easier to implement (no WASM compilation)
- ✅ No browser memory limits
- ✅ Can use native slicer binaries

**Challenges**:
- ❌ Requires backend infrastructure
- ❌ Network latency for large models
- ❌ Privacy concerns (model upload)
- ❌ Breaks web-first architecture

**Recommendation**: Start with Option 1 (WASM), provide Option 2 as fallback for enterprise users.

---

## Slicer Engine Selection

### Phase 1: CuraEngine (Recommended First)

**Why CuraEngine**:
- ✅ Excellent WASM compilation support (Ultimaker has web demos)
- ✅ MIT license (permissive)
- ✅ Industry-standard profiles (widely tested)
- ✅ Active development
- ✅ Smaller binary size vs. PrusaSlicer

**CuraEngine Features**:
- FDM/FFF slicing
- Multi-material support (dual extrusion)
- Supports .3mf and .stl input
- JSON-based configuration
- Variable layer height
- Tree supports, gyroid infill

**Implementation Path**:
```bash
# 1. Clone CuraEngine
git clone https://github.com/Ultimaker/CuraEngine.git

# 2. Compile to WASM (Emscripten)
emconfigure cmake . -DBUILD_WASM=ON
emmake make

# 3. Package for BrepFlow
# Output: cura-engine.wasm + cura-engine.js glue code
```

### Phase 2: PrusaSlicer (Advanced Features)

**Why PrusaSlicer (Later)**:
- ✅ Advanced features (organic supports, arachne engine)
- ✅ Excellent multi-material support (5+ colors)
- ✅ Widely adopted (Prusa, Bambu printers)
- ⚠️ Larger binary size (~30MB)
- ⚠️ More complex WASM compilation

**PrusaSlicer Features**:
- Arachne engine (better perimeters)
- Organic supports
- 5+ color MMU support
- Built-in profiles for 100+ printers

---

## Node Architecture

### New Node Types

#### 1. **SlicerEngine Node** (Abstract)
Base class for all slicer implementations.

```typescript
interface SlicerEngineNode extends NodeDefinition {
  inputs: {
    geometry: Shape;        // From BrepFlow graph
    profile: SlicerProfile; // Print settings
    material: Material[];   // For multi-material
  };
  outputs: {
    gcode: string;          // G-code file content
    preview: MeshPreview;   // Toolpath visualization
    metadata: PrintStats;   // Time, filament, etc.
  };
  params: {
    engine: 'cura' | 'prusa' | 'slic3r';
    qualityPreset: 'draft' | 'normal' | 'fine';
  };
}
```

#### 2. **CuraSlicerNode** (Concrete Implementation)
```typescript
export const CuraSlicerNode: NodeDefinition = {
  id: 'Fabrication::CuraSlicer',
  type: 'Fabrication::CuraSlicer',
  category: 'Fabrication',
  label: 'Cura Slicer',
  description: 'Generate G-code using CuraEngine',

  inputs: {
    geometry: { type: 'Shape', label: 'Model' },
    profile: { type: 'SlicerProfile', label: 'Print Settings' },
  },

  outputs: {
    gcode: { type: 'File', label: 'G-code' },
    preview: { type: 'Mesh', label: 'Toolpath Preview' },
  },

  params: {
    layerHeight: { type: 'number', default: 0.2, min: 0.05, max: 0.4 },
    infillDensity: { type: 'number', default: 20, min: 0, max: 100 },
    printSpeed: { type: 'number', default: 60, min: 10, max: 300 },
    supportEnabled: { type: 'boolean', default: false },
    nozzleTemp: { type: 'number', default: 210, min: 180, max: 280 },
    bedTemp: { type: 'number', default: 60, min: 0, max: 120 },
  },

  async evaluate(ctx, inputs, params) {
    // 1. Convert Shape to STL mesh
    const stlData = await ctx.geom.invoke('EXPORT_STL', {
      shape: inputs.geometry
    });

    // 2. Invoke CuraEngine WASM worker
    const gcode = await ctx.worker.invoke('CURA_SLICE', {
      stl: stlData,
      settings: {
        layer_height: params.layerHeight,
        infill_sparse_density: params.infillDensity,
        speed_print: params.printSpeed,
        support_enable: params.supportEnabled,
        material_print_temperature: params.nozzleTemp,
        material_bed_temperature: params.bedTemp,
      }
    });

    // 3. Generate toolpath preview (optional)
    const preview = await generateToolpathPreview(gcode);

    return {
      gcode,
      preview,
      metadata: {
        printTime: estimatePrintTime(gcode),
        filamentUsed: calculateFilament(gcode),
      }
    };
  }
};
```

#### 3. **PrusaSlicerNode** (Future)
```typescript
export const PrusaSlicerNode: NodeDefinition = {
  id: 'Fabrication::PrusaSlicer',
  // Similar structure to CuraSlicerNode
  // Additional params: organic_supports, arachne_perimeters, etc.
};
```

#### 4. **SlicerProfileNode** (Configuration)
Pre-configured print profiles (PLA, PETG, ABS, etc.)

```typescript
export const SlicerProfileNode: NodeDefinition = {
  id: 'Fabrication::SlicerProfile',
  label: 'Print Profile',

  outputs: {
    profile: { type: 'SlicerProfile' }
  },

  params: {
    material: {
      type: 'enum',
      options: ['PLA', 'PETG', 'ABS', 'TPU', 'ASA'],
      default: 'PLA'
    },
    quality: {
      type: 'enum',
      options: ['draft', 'normal', 'fine', 'ultra-fine'],
      default: 'normal'
    },
    printer: {
      type: 'enum',
      options: ['prusa-mk4', 'bambu-x1c', 'ender-3', 'custom'],
      default: 'custom'
    }
  },

  evaluate(ctx, inputs, params) {
    // Load profile from library
    return {
      profile: loadProfileFromLibrary(
        params.material,
        params.quality,
        params.printer
      )
    };
  }
};
```

#### 5. **MultiMaterialNode** (Multi-Color/Material)
```typescript
export const MultiMaterialNode: NodeDefinition = {
  id: 'Fabrication::MultiMaterial',
  label: 'Multi-Material Assignment',

  inputs: {
    geometries: { type: 'Shape[]', label: 'Parts' }, // Multiple geometries
  },

  outputs: {
    assignment: { type: 'MaterialAssignment' }
  },

  params: {
    materials: {
      type: 'array',
      items: {
        extruder: { type: 'number', min: 1, max: 5 },
        color: { type: 'color' },
        material: { type: 'enum', options: ['PLA', 'PETG', 'TPU'] }
      }
    }
  },

  evaluate(ctx, inputs, params) {
    // Map each geometry to a material/extruder
    return {
      assignment: inputs.geometries.map((geom, idx) => ({
        geometry: geom,
        extruder: params.materials[idx]?.extruder || 1,
        color: params.materials[idx]?.color || '#FFFFFF',
        material: params.materials[idx]?.material || 'PLA'
      }))
    };
  }
};
```

---

## WASM Worker Integration

### Slicer Worker Architecture

```typescript
// packages/engine-occt/wasm/cura-slicer-worker.ts

import CuraEngineModule from './cura-engine.wasm';

export class CuraSlicerWorker {
  private module: CuraEngineWASM;

  async init() {
    this.module = await CuraEngineModule({
      wasmBinary: await fetch('/wasm/cura-engine.wasm').then(r => r.arrayBuffer())
    });
  }

  async slice(stlData: Uint8Array, settings: CuraSettings): Promise<string> {
    // 1. Write STL to WASM filesystem
    const fs = this.module.FS;
    fs.writeFile('/input.stl', stlData);

    // 2. Write settings JSON
    fs.writeFile('/settings.json', JSON.stringify(settings));

    // 3. Run CuraEngine
    this.module.callMain([
      'slice',
      '-j', '/settings.json',
      '-o', '/output.gcode',
      '-l', '/input.stl'
    ]);

    // 4. Read output G-code
    const gcode = fs.readFile('/output.gcode', { encoding: 'utf8' });

    // 5. Cleanup
    fs.unlink('/input.stl');
    fs.unlink('/settings.json');
    fs.unlink('/output.gcode');

    return gcode;
  }
}
```

### Worker Message Protocol

```typescript
// Slicer operation types
type SlicerOperation =
  | { type: 'CURA_SLICE', payload: { stl: Uint8Array, settings: CuraSettings } }
  | { type: 'PRUSA_SLICE', payload: { stl: Uint8Array, settings: PrusaSettings } }
  | { type: 'GET_SLICER_VERSION', payload: { engine: 'cura' | 'prusa' } };

// Extend existing worker protocol
// File: packages/engine-occt/src/worker/geometry-worker.ts
export function handleSlicerOperation(op: SlicerOperation) {
  switch (op.type) {
    case 'CURA_SLICE':
      return curaWorker.slice(op.payload.stl, op.payload.settings);
    case 'PRUSA_SLICE':
      return prusaWorker.slice(op.payload.stl, op.payload.settings);
    case 'GET_SLICER_VERSION':
      return getSlicerVersion(op.payload.engine);
  }
}
```

---

## UI/UX Considerations

### 1. **Slicer Settings Panel**
Collapsible parameter panel with sections:
- **Quality**: Layer height, perimeters, infill
- **Speed**: Print speed, travel speed, retraction
- **Temperature**: Nozzle, bed, chamber
- **Support**: Enable/disable, pattern, density
- **Advanced**: Coasting, z-hop, wipe

### 2. **G-code Preview**
3D visualization of toolpath using Three.js:
- Color-coded by extrusion type (perimeter, infill, support)
- Layer-by-layer scrubbing
- Time/filament estimation display

### 3. **Multi-Material Workflow**
1. User creates multiple geometries in graph
2. Connects to `MultiMaterialNode`
3. Assigns colors/materials per part
4. Connects to `CuraSlicerNode` with multi-extrusion settings
5. Exports G-code with tool-change commands

### 4. **Profile Library**
Pre-configured profiles for common scenarios:
- **PLA Standard** (0.2mm, 20% infill, 60mm/s)
- **PETG Strong** (0.2mm, 40% infill, 45mm/s)
- **TPU Flexible** (0.3mm, 10% infill, 20mm/s)
- **ABS Engineering** (0.15mm, 30% infill, 50mm/s)

---

## Implementation Roadmap

### Phase 1: CuraEngine WASM (Weeks 1-4)
**Goal**: Single-material G-code generation

- [ ] Week 1: CuraEngine WASM compilation
  - Set up Emscripten toolchain
  - Compile CuraEngine to WASM
  - Package WASM binary + JS glue code
  - Verify basic slicing works

- [ ] Week 2: Worker integration
  - Create `CuraSlicerWorker` class
  - Extend geometry worker protocol
  - Implement STL → G-code pipeline
  - Add error handling

- [ ] Week 3: Node implementation
  - Implement `CuraSlicerNode`
  - Create `SlicerProfileNode`
  - Add parameter validation
  - Write unit tests

- [ ] Week 4: UI/UX
  - Build slicer settings panel
  - Add G-code preview renderer
  - Implement download/export
  - E2E testing

**Deliverable**: Users can create geometry → slice with Cura → download G-code

### Phase 2: Multi-Material Support (Weeks 5-6)
**Goal**: Multi-color/multi-material printing

- [ ] Week 5: Multi-material nodes
  - Implement `MultiMaterialNode`
  - Extend CuraSlicerNode for multi-extrusion
  - Add material assignment UI

- [ ] Week 6: Testing & refinement
  - Test dual-extrusion workflows
  - Validate G-code with 2+ colors
  - Add multi-material examples

**Deliverable**: Users can assign different materials to different parts

### Phase 3: PrusaSlicer Integration (Weeks 7-10)
**Goal**: Advanced slicing features

- [ ] Week 7-8: PrusaSlicer WASM compilation
  - Compile PrusaSlicer to WASM (more complex)
  - Package and optimize binary size

- [ ] Week 9: Node implementation
  - Implement `PrusaSlicerNode`
  - Add advanced parameters (organic supports, arachne)

- [ ] Week 10: Testing & comparison
  - Side-by-side Cura vs. Prusa testing
  - Performance benchmarking
  - Documentation

**Deliverable**: Users can choose between Cura or Prusa slicers

### Phase 4: Polish & Production (Weeks 11-12)
**Goal**: Production-ready release

- [ ] Week 11: Optimization
  - WASM binary size reduction
  - Worker pool for parallel slicing
  - Caching sliced results

- [ ] Week 12: Documentation & release
  - User guide for G-code generation
  - Video tutorials
  - Example workflows (multi-color vase, parametric enclosure)
  - Release announcement

**Deliverable**: Full G-code generation in BrepFlow v0.3

---

## Testing Strategy

### Unit Tests
- WASM module loading
- STL → G-code conversion
- Parameter validation
- Multi-material assignment

### Integration Tests
- BrepFlow graph → STL → G-code pipeline
- Slicer profile loading
- Worker message protocol

### E2E Tests
- Complete workflow: Design → Slice → Download G-code
- Multi-material workflow
- Slicer comparison (Cura vs. Prusa output)

### Validation Tests
- G-code syntax validation (M/G command parsing)
- Printer compatibility (test with virtual printers)
- Actual print tests (physical validation)

---

## Technical Challenges & Solutions

### Challenge 1: WASM Binary Size
**Problem**: CuraEngine ~15MB, PrusaSlicer ~30MB (large download)

**Solutions**:
- ✅ WASM compression (Brotli): 15MB → ~5MB
- ✅ Lazy loading: Only load slicer when needed
- ✅ CDN caching: Cache WASM binaries
- ✅ Progressive enhancement: Show "Loading slicer..." state

### Challenge 2: Memory Constraints
**Problem**: Browser heap limit (~2GB)

**Solutions**:
- ✅ Worker-based isolation (separate heap)
- ✅ Streaming STL processing (don't load entire model)
- ✅ LRU cache for sliced results
- ✅ Fallback to server-side for huge models

### Challenge 3: Slicer Configuration Complexity
**Problem**: CuraEngine has 500+ settings

**Solutions**:
- ✅ Preset profiles (hide complexity)
- ✅ 3-tier UI: Basic, Advanced, Expert
- ✅ Import Cura profiles (.curaprofile files)
- ✅ Tooltips explaining each setting

### Challenge 4: G-code Validation
**Problem**: No guarantee generated G-code works on all printers

**Solutions**:
- ✅ G-code linter (detect invalid commands)
- ✅ Printer profiles (tested configurations)
- ✅ Virtual printer simulation (detect crashes)
- ✅ Community-contributed profiles

---

## Dependencies

### New Package Dependencies
```json
{
  "dependencies": {
    "@types/emscripten": "^1.39.6",
    "three-gcode-viewer": "^1.0.0"  // For toolpath preview
  },
  "devDependencies": {
    "emscripten": "^3.1.45"
  }
}
```

### Third-Party Slicer Binaries
- **CuraEngine**: https://github.com/Ultimaker/CuraEngine (LGPL-3.0)
- **PrusaSlicer**: https://github.com/prusa3d/PrusaSlicer (AGPL-3.0)

**License Compliance**:
- LGPL-3.0 (CuraEngine): OK for web use, must link dynamically (WASM worker = dynamic)
- AGPL-3.0 (PrusaSlicer): Must offer source code (provide GitHub link in UI)

---

## Success Metrics

### Technical Metrics
- [ ] G-code generation time < 10s for models < 5MB
- [ ] WASM binary load time < 3s (cached)
- [ ] Memory usage < 500MB for typical models
- [ ] Support 95% of common print settings

### User Metrics
- [ ] 80% of users successfully generate G-code on first try
- [ ] < 5% fallback to external slicer after using BrepFlow slicer
- [ ] Positive user feedback on UX (NPS > 50)

### Business Metrics
- [ ] 30% increase in user retention (users stay in BrepFlow ecosystem)
- [ ] 50% of new users cite "G-code generation" as key feature
- [ ] Featured in 3D printing community (r/3Dprinting, Prusa forums)

---

## Future Enhancements (Beyond v0.3)

### Advanced Features
- [ ] **Variable Layer Height**: Adaptive slicing based on curvature
- [ ] **Non-Planar Slicing**: 5-axis printing support
- [ ] **Support Painting**: Manual support placement
- [ ] **Time-Lapse G-code**: Insert pause commands for camera triggers
- [ ] **Remote Monitoring**: Send G-code directly to OctoPrint/Moonraker

### Slicer Engine Expansion
- [ ] **SuperSlicer**: Fork of PrusaSlicer with extra features
- [ ] **IceSL**: Real-time slicing engine
- [ ] **Slic3r**: Original slicer (legacy support)

### Enterprise Features
- [ ] **Server-Side Slicing**: For large models or weak client devices
- [ ] **Batch Slicing**: Slice multiple models in queue
- [ ] **Cloud G-code Library**: Save/share sliced files

---

## Questions & Decisions Needed

1. **Licensing**: Confirm AGPL-3.0 compliance for PrusaSlicer (provide source link)
2. **Slicer Priority**: Start with Cura only, or implement both in parallel?
3. **Profile Library**: Maintain our own profiles, or import from Cura/Prusa repos?
4. **Backend Fallback**: Implement server-side slicing for enterprise users?
5. **Printer Compatibility**: Which printers to officially support profiles for?

---

## References

- **CuraEngine Documentation**: https://github.com/Ultimaker/CuraEngine/wiki
- **PrusaSlicer Manual**: https://help.prusa3d.com/
- **G-code Specification**: https://marlinfw.org/meta/gcode/
- **Emscripten WASM Guide**: https://emscripten.org/docs/compiling/WebAssembly.html
- **SIM4D Gap Analysis**: `claudedocs/SIM4D_TECHNICAL_GAP_ANALYSIS_2025_11_18.md`

---

**Document Version**: 1.0
**Last Updated**: 2025-11-20
**Author**: Claude (Anthropic)
**Review Status**: Pending Engineering Review
