/**
 * Advanced Curve Nodes for Sim4D
 * Implements NURBS curves, analysis, and manipulation operations
 */

import { NodeDefinition } from '@sim4d/types';

// NURBS Curve Creation
export const nurbsCurveNode: NodeDefinition = {
  id: 'Curves::NURBSCurve',
  category: 'Curves',
  label: 'NURBS Curve',
  description: 'Create a NURBS curve from control points and weights',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Control Points',
      required: true,
    },
    weights: {
      type: 'Number[]',
      label: 'Weights',
      required: false,
    },
    degree: {
      type: 'Number',
      label: 'Degree',
      required: false,
    },
    periodic: {
      type: 'Boolean',
      label: 'Periodic',
      required: false,
    },
  },
  outputs: {
    curve: {
      type: 'Curve',
      label: 'NURBS Curve',
    },
  },
  params: {
    degree: {
      type: 'number',
      default: 3,
      min: 1,
      max: 7,
    },
    periodic: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CREATE_NURBS_CURVE', {
      points: inputs.points,
      weights: inputs.weights || null,
      degree: params.degree,
      periodic: params.periodic,
    });
    return { curve: result };
  },
  evaluate: async (inputs, params, context) => {
    return nurbsCurveNode.execute!(inputs, params, context);
  },
};

// Interpolate Curve
export const interpolateCurveNode: NodeDefinition = {
  id: 'Curves::Interpolate',
  category: 'Curves',
  label: 'Interpolate Curve',
  description: 'Create a curve that passes through given points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    tangents: {
      type: 'Vector[]',
      label: 'Tangents',
      required: false,
    },
  },
  outputs: {
    curve: {
      type: 'Curve',
      label: 'Interpolated Curve',
    },
  },
  params: {
    closed: {
      type: 'boolean',
      default: false,
    },
    smooth: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('INTERPOLATE_CURVE', {
      points: inputs.points,
      tangents: inputs.tangents,
      closed: params.closed,
      smoothness: params.smooth,
    });
    return { curve: result };
  },
  evaluate: async (inputs, params, context) => {
    return interpolateCurveNode.execute!(inputs, params, context);
  },
};

// Offset Curve
export const offsetCurveNode: NodeDefinition = {
  id: 'Curves::Offset',
  category: 'Curves',
  label: 'Offset Curve',
  description: 'Offset a curve by a specified distance',
  inputs: {
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
    plane: {
      type: 'Plane',
      label: 'Reference Plane',
      required: false,
    },
  },
  outputs: {
    offset: {
      type: 'Curve',
      label: 'Offset Curve',
    },
  },
  params: {
    distance: {
      type: 'number',
      default: 10,
      min: -1000,
      max: 1000,
    },
    corner: {
      type: 'enum',
      default: 'round',
      options: ['round', 'sharp', 'smooth'],
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('OFFSET_CURVE', {
      curve: inputs.curve,
      distance: params.distance,
      plane: inputs.plane,
      cornerStyle: params.corner,
    });
    return { offset: result };
  },
  evaluate: async (inputs, params, context) => {
    return offsetCurveNode.execute!(inputs, params, context);
  },
};

// Curve Analysis - Curvature
export const curvatureAnalysisNode: NodeDefinition = {
  id: 'Curves::CurvatureAnalysis',
  category: 'Curves',
  label: 'Curvature Analysis',
  description: 'Analyze curvature along a curve',
  inputs: {
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    curvature: {
      type: 'Number[]',
      label: 'Curvature Values',
    },
    maxCurvature: {
      type: 'Number',
      label: 'Maximum Curvature',
    },
    minCurvature: {
      type: 'Number',
      label: 'Minimum Curvature',
    },
    inflectionPoints: {
      type: 'Point[]',
      label: 'Inflection Points',
    },
  },
  params: {
    samples: {
      type: 'number',
      default: 100,
      min: 10,
      max: 1000,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('ANALYZE_CURVATURE', {
      curve: inputs.curve,
      samples: params.samples,
    });
    return {
      curvature: result.values,
      maxCurvature: result.max,
      minCurvature: result.min,
      inflectionPoints: result.inflections,
    };
  },
  evaluate: async (inputs, params, context) => {
    return curvatureAnalysisNode.execute!(inputs, params, context);
  },
};

// Divide Curve
export const divideCurveNode: NodeDefinition = {
  id: 'Curves::Divide',
  category: 'Curves',
  label: 'Divide Curve',
  description: 'Divide a curve into segments',
  inputs: {
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Division Points',
    },
    params: {
      type: 'Number[]',
      label: 'Parameters',
    },
    tangents: {
      type: 'Vector[]',
      label: 'Tangents',
    },
  },
  params: {
    count: {
      type: 'number',
      default: 10,
      min: 2,
      max: 1000,
    },
    byLength: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('DIVIDE_CURVE', {
      curve: inputs.curve,
      count: params.count,
      byLength: params.byLength,
    });
    return {
      points: result.points,
      params: result.params,
      tangents: result.tangents,
    };
  },
  evaluate: async (inputs, params, context) => {
    return divideCurveNode.execute!(inputs, params, context);
  },
};

// Blend Curves
export const blendCurvesNode: NodeDefinition = {
  id: 'Curves::Blend',
  category: 'Curves',
  label: 'Blend Curves',
  description: 'Create a blend curve between two curves',
  inputs: {
    curve1: {
      type: 'Curve',
      label: 'First Curve',
      required: true,
    },
    curve2: {
      type: 'Curve',
      label: 'Second Curve',
      required: true,
    },
    point1: {
      type: 'Point',
      label: 'Start Point',
      required: false,
    },
    point2: {
      type: 'Point',
      label: 'End Point',
      required: false,
    },
  },
  outputs: {
    blend: {
      type: 'Curve',
      label: 'Blend Curve',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      default: 'G1',
      options: ['G0', 'G1', 'G2', 'G3'],
    },
    bulge: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 2,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('BLEND_CURVES', {
      curve1: inputs.curve1,
      curve2: inputs.curve2,
      point1: inputs.point1,
      point2: inputs.point2,
      continuity: params.continuity,
      bulge: params.bulge,
    });
    return { blend: result };
  },
  evaluate: async (inputs, params, context) => {
    return blendCurvesNode.execute!(inputs, params, context);
  },
};

// Project Curve
export const projectCurveNode: NodeDefinition = {
  id: 'Curves::Project',
  category: 'Curves',
  label: 'Project Curve',
  description: 'Project a curve onto a surface or plane',
  inputs: {
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
    target: {
      type: 'Geometry',
      label: 'Target Surface/Plane',
      required: true,
    },
    direction: {
      type: 'Vector',
      label: 'Projection Direction',
      required: false,
    },
  },
  outputs: {
    projected: {
      type: 'Curve[]',
      label: 'Projected Curves',
    },
  },
  params: {
    keepOriginal: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('PROJECT_CURVE', {
      curve: inputs.curve,
      target: inputs.target,
      direction: inputs.direction,
      keepOriginal: params.keepOriginal,
    });
    return { projected: result };
  },
  evaluate: async (inputs, params, context) => {
    return projectCurveNode.execute!(inputs, params, context);
  },
};

// Curve Intersection
export const curveIntersectionNode: NodeDefinition = {
  id: 'Curves::Intersection',
  category: 'Curves',
  label: 'Curve Intersection',
  description: 'Find intersection points between curves',
  inputs: {
    curveA: {
      type: 'Curve',
      label: 'Curve A',
      required: true,
    },
    curveB: {
      type: 'Curve',
      label: 'Curve B',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
    parametersA: {
      type: 'Number[]',
      label: 'Parameters on A',
    },
    parametersB: {
      type: 'Number[]',
      label: 'Parameters on B',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      default: 0.001,
      min: 0.0001,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CURVE_INTERSECTION', {
      curveA: inputs.curveA,
      curveB: inputs.curveB,
      tolerance: params.tolerance,
    });
    return {
      points: result.points,
      parametersA: result.paramsA,
      parametersB: result.paramsB,
    };
  },
  evaluate: async (inputs, params, context) => {
    return curveIntersectionNode.execute!(inputs, params, context);
  },
};

// Export all curve nodes
export const curveNodes = [
  nurbsCurveNode,
  interpolateCurveNode,
  offsetCurveNode,
  curvatureAnalysisNode,
  divideCurveNode,
  blendCurvesNode,
  projectCurveNode,
  curveIntersectionNode,
];
