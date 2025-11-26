import type { NodeDefinition, ShapeHandle, Vec3 } from '@sim4d/types';

export const BoundaryNode: NodeDefinition<
  { curves: ShapeHandle[] },
  { surface: ShapeHandle },
  { tolerance: number; continuity: string }
> = {
  id: 'Surface::Boundary',
  category: 'Surface',
  label: 'Boundary Surface',
  description: 'Create a surface bounded by curves',
  inputs: {
    curves: { type: 'Curve', multiple: true },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
    continuity: {
      type: 'string',
      label: 'Continuity',
      default: 'C1',
      options: ['C0', 'C1', 'C2'],
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.curves || inputs.curves.length < 3) {
      throw new Error('Boundary surface requires at least 3 curves');
    }

    const result = await ctx.worker.invoke('CREATE_BOUNDARY_SURFACE', {
      curves: inputs.curves,
      tolerance: params.tolerance,
      continuity: params.continuity,
    });
    return { surface: result };
  },
};

export const NetworkSurfaceNode: NodeDefinition<
  { uCurves: ShapeHandle[]; vCurves: ShapeHandle[] },
  { surface: ShapeHandle },
  { tolerance: number; uDegree: number; vDegree: number }
> = {
  id: 'Surface::Network',
  category: 'Surface',
  label: 'Network Surface',
  description: 'Create surface from network of curves',
  inputs: {
    uCurves: { type: 'Curve', multiple: true },
    vCurves: { type: 'Curve', multiple: true },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
    uDegree: {
      type: 'number',
      label: 'U Degree',
      default: 3,
      min: 1,
      max: 8,
    },
    vDegree: {
      type: 'number',
      label: 'V Degree',
      default: 3,
      min: 1,
      max: 8,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (
      !inputs.uCurves ||
      !inputs.vCurves ||
      inputs.uCurves.length < 2 ||
      inputs.vCurves.length < 2
    ) {
      throw new Error('Network surface requires at least 2 U curves and 2 V curves');
    }

    const result = await ctx.worker.invoke('CREATE_NETWORK_SURFACE', {
      uCurves: inputs.uCurves,
      vCurves: inputs.vCurves,
      tolerance: params.tolerance,
      uDegree: params.uDegree,
      vDegree: params.vDegree,
    });
    return { surface: result };
  },
};

export const BlendSurfaceNode: NodeDefinition<
  { surface1: ShapeHandle; surface2: ShapeHandle; edge1: ShapeHandle; edge2: ShapeHandle },
  { surface: ShapeHandle },
  { radius: number; continuity: string; tension: number }
> = {
  id: 'Surface::Blend',
  category: 'Surface',
  label: 'Blend Surface',
  description: 'Create a blend surface between two surfaces',
  inputs: {
    surface1: { type: 'Surface' },
    surface2: { type: 'Surface' },
    edge1: { type: 'Curve' },
    edge2: { type: 'Curve' },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Blend Radius',
      default: 5.0,
      min: 0.1,
      max: 100.0,
    },
    continuity: {
      type: 'string',
      label: 'Continuity',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    tension: {
      type: 'number',
      label: 'Tension',
      default: 1.0,
      min: 0.1,
      max: 2.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_BLEND_SURFACE', {
      surface1: inputs.surface1,
      surface2: inputs.surface2,
      edge1: inputs.edge1,
      edge2: inputs.edge2,
      radius: params.radius,
      continuity: params.continuity,
      tension: params.tension,
    });
    return { surface: result };
  },
};

export const PatchSurfaceNode: NodeDefinition<
  { points: Vec3[][] },
  { surface: ShapeHandle },
  { uDegree: number; vDegree: number; periodic: boolean }
> = {
  id: 'Surface::Patch',
  category: 'Surface',
  label: 'Patch Surface',
  description: 'Create a NURBS patch surface from control points',
  inputs: {
    points: { type: 'Vector', multiple: true, optional: true },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {
    points: {
      type: 'vec3array',
      label: 'Control Points Grid',
      default: [
        [
          { x: 0, y: 0, z: 0 },
          { x: 33, y: 0, z: 10 },
          { x: 66, y: 0, z: 0 },
          { x: 100, y: 0, z: 0 },
        ],
        [
          { x: 0, y: 33, z: 10 },
          { x: 33, y: 33, z: 20 },
          { x: 66, y: 33, z: 10 },
          { x: 100, y: 33, z: 10 },
        ],
        [
          { x: 0, y: 66, z: 0 },
          { x: 33, y: 66, z: 10 },
          { x: 66, y: 66, z: 0 },
          { x: 100, y: 66, z: 0 },
        ],
        [
          { x: 0, y: 100, z: 0 },
          { x: 33, y: 100, z: 0 },
          { x: 66, y: 100, z: 0 },
          { x: 100, y: 100, z: 0 },
        ],
      ],
    },
    uDegree: {
      type: 'number',
      label: 'U Degree',
      default: 3,
      min: 1,
      max: 8,
    },
    vDegree: {
      type: 'number',
      label: 'V Degree',
      default: 3,
      min: 1,
      max: 8,
    },
    periodic: {
      type: 'boolean',
      label: 'Periodic',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const points = inputs.points || params.points;

    if (!points || points.length < 2 || !Array.isArray(points[0]) || points[0].length < 2) {
      throw new Error('Patch surface requires at least 2x2 control points grid');
    }

    const result = await ctx.worker.invoke('CREATE_PATCH_SURFACE', {
      points,
      uDegree: params.uDegree,
      vDegree: params.vDegree,
      periodic: params.periodic,
    });
    return { surface: result };
  },
};

export const TrimSurfaceNode: NodeDefinition<
  { surface: ShapeHandle; trimmingCurves: ShapeHandle[] },
  { surface: ShapeHandle },
  { sense: boolean; tolerance: number }
> = {
  id: 'Surface::Trim',
  category: 'Surface',
  label: 'Trim Surface',
  description: 'Trim a surface with curves',
  inputs: {
    surface: { type: 'Surface' },
    trimmingCurves: { type: 'Curve', multiple: true },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {
    sense: {
      type: 'boolean',
      label: 'Inside/Outside',
      default: true,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.trimmingCurves || inputs.trimmingCurves.length === 0) {
      throw new Error('Trim surface requires at least one trimming curve');
    }

    const result = await ctx.worker.invoke('TRIM_SURFACE', {
      surface: inputs.surface,
      trimmingCurves: inputs.trimmingCurves,
      sense: params.sense,
      tolerance: params.tolerance,
    });
    return { surface: result };
  },
};

export const UntrimSurfaceNode: NodeDefinition<
  { surface: ShapeHandle },
  { surface: ShapeHandle },
  Record<string, never>
> = {
  id: 'Surface::Untrim',
  category: 'Surface',
  label: 'Untrim Surface',
  description: 'Remove trimming from a surface',
  inputs: {
    surface: { type: 'Surface' },
  },
  outputs: {
    surface: { type: 'Surface' },
  },
  params: {},
  async evaluate(ctx, inputs, _params) {
    const result = await ctx.worker.invoke('UNTRIM_SURFACE', {
      surface: inputs.surface,
    });
    return { surface: result };
  },
};

export const advancedSurfaceNodes = [
  BoundaryNode,
  NetworkSurfaceNode,
  BlendSurfaceNode,
  PatchSurfaceNode,
  TrimSurfaceNode,
  UntrimSurfaceNode,
];
