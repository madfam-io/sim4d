/**
 * Analysis and Measurement Nodes for BrepFlow
 * Implements geometric analysis, measurements, and evaluation operations
 */

import { NodeDefinition } from '@brepflow/types';

// Distance Measurement
export const distanceNode: NodeDefinition = {
  id: 'Analysis::Distance',
  category: 'Analysis',
  label: 'Distance',
  description: 'Measure distance between geometries',
  inputs: {
    geometryA: {
      type: 'Geometry',
      label: 'Geometry A',
      required: true,
    },
    geometryB: {
      type: 'Geometry',
      label: 'Geometry B',
      required: true,
    },
  },
  outputs: {
    distance: {
      type: 'Number',
      label: 'Distance',
    },
    pointA: {
      type: 'Point',
      label: 'Closest Point A',
    },
    pointB: {
      type: 'Point',
      label: 'Closest Point B',
    },
  },
  params: {
    signed: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('MEASURE_DISTANCE', {
      geometryA: inputs.geometryA,
      geometryB: inputs.geometryB,
      signed: params.signed,
    });
    return {
      distance: result.distance,
      pointA: result.closestPointA,
      pointB: result.closestPointB,
    };
  },
  evaluate: async (context, inputs, params) => {
    return distanceNode.execute!(inputs, params, context);
  },
};

// Closest Point
export const closestPointNode: NodeDefinition = {
  id: 'Analysis::ClosestPoint',
  category: 'Analysis',
  label: 'Closest Point',
  description: 'Find closest point on geometry',
  inputs: {
    point: {
      type: 'Point',
      label: 'Sample Point',
      required: true,
    },
    geometry: {
      type: 'Geometry',
      label: 'Target Geometry',
      required: true,
    },
  },
  outputs: {
    closest: {
      type: 'Point',
      label: 'Closest Point',
    },
    distance: {
      type: 'Number',
      label: 'Distance',
    },
    parameter: {
      type: 'Number',
      label: 'Parameter',
    },
    normal: {
      type: 'Vector',
      label: 'Normal',
    },
  },
  params: {},
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CLOSEST_POINT', {
      point: inputs.point,
      geometry: inputs.geometry,
    });
    return {
      closest: result.closestPoint,
      distance: result.distance,
      parameter: result.parameter,
      normal: result.normal,
    };
  },
  evaluate: async (context, inputs, params) => {
    return closestPointNode.execute!(inputs, params, context);
  },
};

// Area Measurement
export const areaNode: NodeDefinition = {
  id: 'Analysis::Area',
  category: 'Analysis',
  label: 'Area',
  description: 'Calculate surface area',
  inputs: {
    geometry: {
      type: 'Geometry',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    area: {
      type: 'Number',
      label: 'Area',
    },
    centroid: {
      type: 'Point',
      label: 'Centroid',
    },
  },
  params: {
    worldSpace: {
      type: 'boolean',
      default: true,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CALCULATE_AREA', {
      geometry: inputs.geometry,
      worldSpace: params.worldSpace,
    });
    return {
      area: result.area,
      centroid: result.centroid,
    };
  },
  evaluate: async (context, inputs, params) => {
    return areaNode.execute!(inputs, params, context);
  },
};

// Volume Measurement
export const volumeNode: NodeDefinition = {
  id: 'Analysis::Volume',
  category: 'Analysis',
  label: 'Volume',
  description: 'Calculate volume of solid',
  inputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
      required: true,
    },
  },
  outputs: {
    volume: {
      type: 'Number',
      label: 'Volume',
    },
    centroid: {
      type: 'Point',
      label: 'Centroid',
    },
    surfaceArea: {
      type: 'Number',
      label: 'Surface Area',
    },
  },
  params: {},
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('CALCULATE_VOLUME', {
      solid: inputs.solid,
    });
    return {
      volume: result.volume,
      centroid: result.centroid,
      surfaceArea: result.surfaceArea,
    };
  },
  evaluate: async (context, inputs, params) => {
    return volumeNode.execute!(inputs, params, context);
  },
};

// Mass Properties
export const massPropertiesNode: NodeDefinition = {
  id: 'Analysis::MassProperties',
  category: 'Analysis',
  label: 'Mass Properties',
  description: 'Calculate mass properties of geometry',
  inputs: {
    geometry: {
      type: 'Geometry',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    volume: {
      type: 'Number',
      label: 'Volume',
    },
    area: {
      type: 'Number',
      label: 'Surface Area',
    },
    mass: {
      type: 'Number',
      label: 'Mass',
    },
    centroid: {
      type: 'Point',
      label: 'Centroid',
    },
    inertia: {
      type: 'Matrix',
      label: 'Inertia Tensor',
    },
    momentOfInertia: {
      type: 'Matrix',
      label: 'Moment of Inertia',
    },
    principalAxes: {
      type: 'Vector[]',
      label: 'Principal Axes',
    },
  },
  params: {
    density: {
      type: 'number',
      default: 1.0,
      min: 0.001,
      max: 100000,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('MASS_PROPERTIES', {
      geometry: inputs.geometry,
      density: params.density,
    });
    return result;
  },
  evaluate: async (context, inputs, params) => {
    return massPropertiesNode.execute!(inputs, params, context);
  },
};

// Bounding Box
export const boundingBoxNode: NodeDefinition = {
  id: 'Analysis::BoundingBox',
  category: 'Analysis',
  label: 'Bounding Box',
  description: 'Get bounding box of geometry',
  inputs: {
    geometry: {
      type: 'Geometry',
      label: 'Geometry',
      required: true,
    },
    plane: {
      type: 'Plane',
      label: 'Orientation Plane',
      required: false,
    },
  },
  outputs: {
    box: {
      type: 'Box',
      label: 'Bounding Box',
    },
    min: {
      type: 'Point',
      label: 'Min Point',
    },
    max: {
      type: 'Point',
      label: 'Max Point',
    },
    center: {
      type: 'Point',
      label: 'Center',
    },
    diagonal: {
      type: 'Number',
      label: 'Diagonal',
    },
  },
  params: {
    alignment: {
      type: 'enum',
      default: 'world',
      options: ['world', 'plane', 'oriented'],
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('BOUNDING_BOX', {
      geometry: inputs.geometry,
      alignment: params.alignment || 'world',
      plane: inputs.plane || params.plane || null,
    });
    return result;
  },
  evaluate: async (context, inputs, params) => {
    return boundingBoxNode.execute!(inputs, params, context);
  },
};

// Intersection Analysis
export const intersectionNode: NodeDefinition = {
  id: 'Analysis::Intersection',
  category: 'Analysis',
  label: 'Intersection',
  description: 'Find intersections between geometries',
  inputs: {
    geometryA: {
      type: 'Geometry',
      label: 'Geometry A',
      required: true,
    },
    geometryB: {
      type: 'Geometry',
      label: 'Geometry B',
      required: true,
    },
  },
  outputs: {
    curves: {
      type: 'Curve[]',
      label: 'Intersection Curves',
    },
    points: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
    count: {
      type: 'Number',
      label: 'Intersection Count',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      default: 0.001,
      min: 0.0001,
      max: 1,
    },
    type: {
      type: 'enum',
      default: 'all',
      options: ['all', 'curves', 'points'],
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('INTERSECTION', {
      geometryA: inputs.geometryA,
      geometryB: inputs.geometryB,
      tolerance: params.tolerance,
    });
    return {
      intersection: result,
    };
  },
  evaluate: async (context, inputs, params) => {
    return intersectionNode.execute!(inputs, params, context);
  },
};

// Evaluate Curve
export const evaluateCurveNode: NodeDefinition = {
  id: 'Analysis::EvaluateCurve',
  category: 'Analysis',
  label: 'Evaluate Curve',
  description: 'Evaluate curve at parameter',
  inputs: {
    curve: {
      type: 'Curve',
      label: 'Curve',
      required: true,
    },
    parameter: {
      type: 'Number',
      label: 'Parameter',
      required: false,
    },
  },
  outputs: {
    point: {
      type: 'Point',
      label: 'Point',
    },
    tangent: {
      type: 'Vector',
      label: 'Tangent',
    },
    normal: {
      type: 'Vector',
      label: 'Normal',
    },
    curvature: {
      type: 'Number',
      label: 'Curvature',
    },
    frame: {
      type: 'Plane',
      label: 'Frame',
    },
  },
  params: {
    parameter: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 1,
    },
    normalized: {
      type: 'boolean',
      default: true,
    },
  },
  execute: async (inputs, params, context) => {
    const t = inputs.parameter ?? params.parameter;

    const result = await context.worker.invoke('EVALUATE_CURVE', {
      curve: inputs.curve,
      parameter: t,
      normalized: params.normalized,
    });
    return result;
  },
  evaluate: async (context, inputs, params) => {
    return evaluateCurveNode.execute!(inputs, params, context);
  },
};

// Evaluate Surface
export const evaluateSurfaceNode: NodeDefinition = {
  id: 'Analysis::EvaluateSurface',
  category: 'Analysis',
  label: 'Evaluate Surface',
  description: 'Evaluate surface at UV parameter',
  inputs: {
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
    u: {
      type: 'Number',
      label: 'U Parameter',
      required: false,
    },
    v: {
      type: 'Number',
      label: 'V Parameter',
      required: false,
    },
  },
  outputs: {
    point: {
      type: 'Point',
      label: 'Point',
    },
    normal: {
      type: 'Vector',
      label: 'Normal',
    },
    uTangent: {
      type: 'Vector',
      label: 'U Tangent',
    },
    vTangent: {
      type: 'Vector',
      label: 'V Tangent',
    },
    frame: {
      type: 'Plane',
      label: 'Frame',
    },
  },
  params: {
    u: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 1,
    },
    v: {
      type: 'number',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  execute: async (inputs, params, context) => {
    const u = inputs.u ?? params.u;
    const v = inputs.v ?? params.v;

    const result = await context.worker.invoke('EVALUATE_SURFACE', {
      surface: inputs.surface,
      u: u,
      v: v,
    });
    return result;
  },
  evaluate: async (context, inputs, params) => {
    return evaluateSurfaceNode.execute!(inputs, params, context);
  },
};

// Collision Detection
export const collisionDetectionNode: NodeDefinition = {
  id: 'Analysis::Collision',
  category: 'Analysis',
  label: 'Collision Detection',
  description: 'Detect collisions between geometries',
  inputs: {
    geometryA: {
      type: 'Geometry',
      label: 'Geometry A',
      required: true,
    },
    geometryB: {
      type: 'Geometry',
      label: 'Geometry B',
      required: true,
    },
  },
  outputs: {
    collides: {
      type: 'Boolean',
      label: 'Has Collision',
    },
    penetrationDepth: {
      type: 'Number',
      label: 'Penetration Depth',
    },
    contactPoints: {
      type: 'Point[]',
      label: 'Contact Points',
    },
    containment: {
      type: 'String',
      label: 'Containment',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      default: 0.001,
      min: 0,
      max: 10,
    },
    includeContainment: {
      type: 'boolean',
      default: false,
    },
  },
  execute: async (inputs, params, context) => {
    const result = await context.worker.invoke('COLLISION_DETECTION', {
      geometryA: inputs.geometryA,
      geometryB: inputs.geometryB,
      tolerance: params.tolerance || 0.001,
      includeContainment: params.includeContainment,
    });
    return result;
  },
  evaluate: async (context, inputs, params) => {
    return collisionDetectionNode.execute!(inputs, params, context);
  },
};

// Export all analysis nodes
export const analysisNodes = [
  distanceNode,
  closestPointNode,
  areaNode,
  volumeNode,
  massPropertiesNode,
  boundingBoxNode,
  intersectionNode,
  evaluateCurveNode,
  evaluateSurfaceNode,
  collisionDetectionNode,
];
