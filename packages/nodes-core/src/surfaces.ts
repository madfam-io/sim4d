/**
 * Advanced Surface Nodes for Sim4D
 * Implements NURBS surfaces, analysis, and manipulation operations
 */

import { NodeDefinition } from '@sim4d/types';

// NURBS Surface Creation
export const nurbsSurfaceNode: NodeDefinition = {
  id: 'Surfaces::NURBSSurface',
  category: 'Surfaces',
  label: 'NURBS Surface',
  description: 'Create a NURBS surface from control points',
  inputs: {
    points: {
      type: 'Point[][]',
      label: 'Control Points Grid',
      required: true,
    },
    weights: {
      type: 'Number[][]',
      label: 'Weights',
      required: false,
    },
  },
  outputs: {
    surface: {
      type: 'Surface',
      label: 'NURBS Surface',
    },
  },
  params: {
    degreeU: {
      type: 'number',
      default: 3,
      min: 1,
      max: 7,
    },
    degreeV: {
      type: 'number',
      default: 3,
      min: 1,
      max: 7,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CREATE_NURBS_SURFACE', {
      points: inputs.points,
      weights: inputs.weights,
      degreeU: params.degreeU,
      degreeV: params.degreeV,
    });
    return { surface: result };
  },
  evaluate: async (inputs, params, context) => {
    return nurbsSurfaceNode.execute!(inputs, params, context);
  },
};

// Surface from Curves (Loft)
export const loftSurfaceNode: NodeDefinition = {
  id: 'Surfaces::Loft',
  category: 'Surfaces',
  label: 'Loft Surface',
  description: 'Create a surface by lofting through curves',
  inputs: {
    curves: {
      type: 'Curve[]',
      label: 'Section Curves',
      required: true,
    },
    guides: {
      type: 'Curve[]',
      label: 'Guide Curves',
      required: false,
    },
  },
  outputs: {
    surface: {
      type: 'Surface',
      label: 'Lofted Surface',
    },
  },
  params: {
    closed: {
      type: 'boolean',
      default: false,
    },
    smooth: {
      type: 'boolean',
      default: true,
    },
    rebuild: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('LOFT_SURFACE', {
      curves: inputs.curves,
      guides: inputs.guides,
      closed: params.closed,
      smooth: params.smooth,
      rebuild: params.rebuild,
    });
    return { surface: result };
  },
  evaluate: async (inputs, params, context) => {
    return loftSurfaceNode.execute!(inputs, params, context);
  },
};

// Network Surface
export const networkSurfaceNode: NodeDefinition = {
  id: 'Surfaces::Network',
  category: 'Surfaces',
  label: 'Network Surface',
  description: 'Create a surface from a network of curves',
  inputs: {
    uCurves: {
      type: 'Curve[]',
      label: 'U Curves',
      required: true,
    },
    vCurves: {
      type: 'Curve[]',
      label: 'V Curves',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Surface',
      label: 'Network Surface',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    tolerance: {
      type: 'number',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('NETWORK_SURFACE', {
      uCurves: inputs.uCurves,
      vCurves: inputs.vCurves,
      continuity: params.continuity,
      tolerance: params.tolerance,
    });
    return { surface: result };
  },
  evaluate: async (inputs, params, context) => {
    return networkSurfaceNode.execute!(inputs, params, context);
  },
};

// Patch Surface
export const patchSurfaceNode: NodeDefinition = {
  id: 'Surfaces::Patch',
  category: 'Surfaces',
  label: 'Patch Surface',
  description: 'Create a surface patch from boundary curves',
  inputs: {
    boundaries: {
      type: 'Curve[]',
      label: 'Boundary Curves',
      required: true,
    },
    internal: {
      type: 'Curve[]',
      label: 'Internal Curves',
      required: false,
    },
  },
  outputs: {
    surface: {
      type: 'Surface',
      label: 'Patch Surface',
    },
  },
  params: {
    spans: {
      type: 'number',
      default: 10,
      min: 1,
      max: 50,
    },
    flexibility: {
      type: 'number',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('PATCH_SURFACE', {
      boundaries: inputs.boundaries,
      internal: inputs.internal,
      spans: params.spans,
      flexibility: params.flexibility,
    });
    return { surface: result };
  },
  evaluate: async (inputs, params, context) => {
    return patchSurfaceNode.execute!(inputs, params, context);
  },
};

// Offset Surface
export const offsetSurfaceNode: NodeDefinition = {
  id: 'Surfaces::Offset',
  category: 'Surfaces',
  label: 'Offset Surface',
  description: 'Offset a surface by a specified distance',
  inputs: {
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    offset: {
      type: 'Surface',
      label: 'Offset Surface',
    },
  },
  params: {
    distance: {
      type: 'number',
      default: 10,
      min: -1000,
      max: 1000,
    },
    solid: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('OFFSET_SURFACE', {
      surface: inputs.surface,
      distance: params.distance,
      createSolid: params.solid,
    });
    return { offset: result };
  },
  evaluate: async (inputs, params, context) => {
    return offsetSurfaceNode.execute!(inputs, params, context);
  },
};

// Surface Analysis - Curvature
export const surfaceCurvatureNode: NodeDefinition = {
  id: 'Surfaces::CurvatureAnalysis',
  category: 'Surfaces',
  label: 'Surface Curvature',
  description: 'Analyze curvature of a surface',
  inputs: {
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
    points: {
      type: 'Point[]',
      label: 'Sample Points',
      required: false,
    },
  },
  outputs: {
    gaussian: {
      type: 'Number[]',
      label: 'Gaussian Curvature',
    },
    mean: {
      type: 'Number[]',
      label: 'Mean Curvature',
    },
    principal1: {
      type: 'Number[]',
      label: 'Principal Curvature 1',
    },
    principal2: {
      type: 'Number[]',
      label: 'Principal Curvature 2',
    },
  },
  params: {
    samplesU: {
      type: 'number',
      default: 20,
      min: 5,
      max: 100,
    },
    samplesV: {
      type: 'number',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('SURFACE_CURVATURE', {
      surface: inputs.surface,
      points: inputs.points,
      samplesU: params.samplesU,
      samplesV: params.samplesV,
    });
    return {
      gaussian: result.gaussian,
      mean: result.mean,
      principal1: result.principal1,
      principal2: result.principal2,
    };
  },
  evaluate: async (inputs, params, context) => {
    return surfaceCurvatureNode.execute!(inputs, params, context);
  },
};

// Isotrim (Extract Surface Region)
export const isotrimNode: NodeDefinition = {
  id: 'Surfaces::Isotrim',
  category: 'Surfaces',
  label: 'Isotrim',
  description: 'Extract a region from a surface using UV domain',
  inputs: {
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    trimmed: {
      type: 'Surface',
      label: 'Trimmed Surface',
    },
  },
  params: {
    uMin: {
      type: 'number',
      default: 0,
      min: 0,
      max: 1,
    },
    uMax: {
      type: 'number',
      default: 1,
      min: 0,
      max: 1,
    },
    vMin: {
      type: 'number',
      default: 0,
      min: 0,
      max: 1,
    },
    vMax: {
      type: 'number',
      default: 1,
      min: 0,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('ISOTRIM', {
      surface: inputs.surface,
      uMin: params.uMin,
      uMax: params.uMax,
      vMin: params.vMin,
      vMax: params.vMax,
    });
    return { trimmed: result };
  },
  evaluate: async (inputs, params, context) => {
    return isotrimNode.execute!(inputs, params, context);
  },
};

// Surface Split
export const surfaceSplitNode: NodeDefinition = {
  id: 'Surfaces::Split',
  category: 'Surfaces',
  label: 'Split Surface',
  description: 'Split a surface with curves or other surfaces',
  inputs: {
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
    splitters: {
      type: 'Geometry[]',
      label: 'Splitting Curves/Surfaces',
      required: true,
    },
  },
  outputs: {
    fragments: {
      type: 'Surface[]',
      label: 'Surface Fragments',
    },
  },
  params: {
    keepAll: {
      type: 'boolean',
      default: true,
    },
    tolerance: {
      type: 'number',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('SPLIT_SURFACE', {
      surface: inputs.surface,
      splitters: inputs.splitters,
      keepAll: params.keepAll,
      tolerance: params.tolerance,
    });
    return { fragments: result };
  },
  evaluate: async (inputs, params, context) => {
    return surfaceSplitNode.execute!(inputs, params, context);
  },
};

// Blend Surfaces
export const blendSurfacesNode: NodeDefinition = {
  id: 'Surfaces::Blend',
  category: 'Surfaces',
  label: 'Blend Surfaces',
  description: 'Create a blend surface between two surfaces',
  inputs: {
    surface1: {
      type: 'Surface',
      label: 'First Surface',
      required: true,
    },
    surface2: {
      type: 'Surface',
      label: 'Second Surface',
      required: true,
    },
    edge1: {
      type: 'Curve',
      label: 'First Edge',
      required: false,
    },
    edge2: {
      type: 'Curve',
      label: 'Second Edge',
      required: false,
    },
  },
  outputs: {
    blend: {
      type: 'Surface',
      label: 'Blend Surface',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    bulge: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 2,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('BLEND_SURFACES', {
      surface1: inputs.surface1,
      surface2: inputs.surface2,
      edge1: inputs.edge1,
      edge2: inputs.edge2,
      continuity: params.continuity,
      bulge: params.bulge,
    });
    return { blend: result };
  },
  evaluate: async (inputs, params, context) => {
    return blendSurfacesNode.execute!(inputs, params, context);
  },
};

// Export all surface nodes
export const surfaceNodes = [
  nurbsSurfaceNode,
  loftSurfaceNode,
  networkSurfaceNode,
  patchSurfaceNode,
  offsetSurfaceNode,
  surfaceCurvatureNode,
  isotrimNode,
  surfaceSplitNode,
  blendSurfacesNode,
];
