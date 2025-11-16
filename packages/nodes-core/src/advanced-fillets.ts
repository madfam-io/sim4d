import { NodeDefinition, SocketType } from '@brepflow/types';
import { NumberParam, BoolParam, StringParam } from './utils/param-utils';

/**
 * Variable Radius Fillet Node
 * Creates fillets with varying radius along edges
 */
export const VariableFilletNode: NodeDefinition<
  { shape: ShapeHandle; edges?: ShapeHandle[] },
  { shape: ShapeHandle },
  { startRadius: number; endRadius: number; transition: 'linear' | 'smooth' }
> = {
  id: 'Features::VariableFillet',
  name: 'Variable Fillet',
  description: 'Apply fillet with varying radius along edges',
  category: 'Features',
  inputs: {
    shape: { type: 'Shape', description: 'Shape to fillet' },
    edges: { type: 'Shape[]', description: 'Edges to fillet (optional, all if not specified)' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Filleted shape' },
  },
  params: {
    startRadius: { type: 'number', default: 5, min: 0, description: 'Start radius' },
    endRadius: { type: 'number', default: 10, min: 0, description: 'End radius' },
    transition: {
      type: 'select',
      default: 'linear',
      options: ['linear', 'smooth'],
      description: 'Radius transition type',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('VARIABLE_FILLET', {
      shapeId: inputs.shape.id,
      edgeIds: inputs.edges?.map((e) => e.id),
      startRadius: params.startRadius,
      endRadius: params.endRadius,
      transition: params.transition,
    });
    return { shape: result };
  },
};

/**
 * Face Blend Node
 * Creates smooth blends between faces
 */
export const FaceBlendNode: NodeDefinition<
  { shape: ShapeHandle; face1: ShapeHandle; face2: ShapeHandle },
  { shape: ShapeHandle },
  { radius: number; continuity: 'G0' | 'G1' | 'G2' }
> = {
  id: 'Features::FaceBlend',
  name: 'Face Blend',
  description: 'Create smooth blend between two faces',
  category: 'Features',
  inputs: {
    shape: { type: 'Shape', description: 'Base shape' },
    face1: { type: 'Shape', description: 'First face' },
    face2: { type: 'Shape', description: 'Second face' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Blended shape' },
  },
  params: {
    radius: { type: 'number', default: 10, min: 0, description: 'Blend radius' },
    continuity: {
      type: 'select',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
      description: 'Continuity level (G0=position, G1=tangent, G2=curvature)',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('FACE_BLEND', {
      shapeId: inputs.shape.id,
      face1Id: inputs.face1.id,
      face2Id: inputs.face2.id,
      radius: params.radius,
      continuity: params.continuity,
    });
    return { shape: result };
  },
};

/**
 * Full Round Fillet Node
 * Creates a fillet that consumes an entire face
 */
export const FullRoundFilletNode: NodeDefinition<
  { shape: ShapeHandle; sideFace1: ShapeHandle; centerFace: ShapeHandle; sideFace2: ShapeHandle },
  { shape: ShapeHandle },
  Record<string, never>
> = {
  id: 'Features::FullRoundFillet',
  name: 'Full Round Fillet',
  description: 'Create a fillet that replaces center face',
  category: 'Features',
  inputs: {
    shape: { type: 'Shape', description: 'Base shape' },
    sideFace1: { type: 'Shape', description: 'First side face' },
    centerFace: { type: 'Shape', description: 'Face to be replaced' },
    sideFace2: { type: 'Shape', description: 'Second side face' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Filleted shape' },
  },
  params: {},
  async evaluate(ctx, inputs) {
    const result = await ctx.worker.invoke('FULL_ROUND_FILLET', {
      shapeId: inputs.shape.id,
      sideFace1Id: inputs.sideFace1.id,
      centerFaceId: inputs.centerFace.id,
      sideFace2Id: inputs.sideFace2.id,
    });
    return { shape: result };
  },
};

/**
 * Setback Fillet Node
 * Creates fillets with setback corners at vertices
 */
export const SetbackFilletNode: NodeDefinition<
  { shape: ShapeHandle; edges: ShapeHandle[] },
  { shape: ShapeHandle },
  { radius: number; setback1: number; setback2: number }
> = {
  id: 'Features::SetbackFillet',
  name: 'Setback Fillet',
  description: 'Create fillets with vertex setbacks',
  category: 'Features',
  inputs: {
    shape: { type: 'Shape', description: 'Shape to fillet' },
    edges: { type: 'Shape[]', description: 'Edges to fillet' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Filleted shape' },
  },
  params: {
    radius: { type: 'number', default: 10, min: 0, description: 'Fillet radius' },
    setback1: { type: 'number', default: 5, min: 0, description: 'First vertex setback' },
    setback2: { type: 'number', default: 5, min: 0, description: 'Second vertex setback' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SETBACK_FILLET', {
      shapeId: inputs.shape.id,
      edgeIds: inputs.edges.map((e) => e.id),
      radius: params.radius,
      setback1: params.setback1,
      setback2: params.setback2,
    });
    return { shape: result };
  },
};

export const MultiEdgeFillet = {
  type: 'Features::MultiEdgeFillet',
  category: 'Features',
  description: 'Apply fillets to multiple edges with different radii',
  icon: 'Features::Fillet',

  inputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Shape',
      required: true,
    },
    edges: {
      type: 'Shape' as SocketType,
      label: 'Edges',
      multiple: true,
    },
  },

  outputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Filleted Shape',
    },
  },

  params: {
    radii: NumberParam({ default: 2.0, min: 0.01, label: 'Radii' }),
    useVariableRadius: BoolParam({ default: false, label: 'Variable Radius' }),
    edgeSelection: {
      type: 'enum' as const,
      default: 'manual',
      options: [
        { value: 'manual', label: 'Manual Selection' },
        { value: 'byAngle', label: 'By Angle' },
        { value: 'byLength', label: 'By Length' },
      ],
      label: 'Edge Selection',
    },
  },

  evaluate: async (ctx, inputs, params) => {
    const result = await ctx.geom.invoke('MULTI_EDGE_FILLET', {
      shape: inputs.shape,
      edges: inputs.edges,
      radii: params.radii,
      useVariableRadius: params.useVariableRadius,
      edgeSelection: params.edgeSelection,
    });
    return { shape: result };
  },
};

export const ChamferEdges = {
  type: 'Features::ChamferEdges',
  category: 'Features',
  description: 'Apply chamfers to edges',
  icon: 'Features::Chamfer',

  inputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Shape',
    },
    edges: {
      type: 'Shape' as SocketType,
      label: 'Edges',
      multiple: true,
    },
    distance1: {
      type: 'Number' as SocketType,
      label: 'Distance 1',
    },
    distance2: {
      type: 'Number' as SocketType,
      label: 'Distance 2',
      optional: true,
    },
  },

  outputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Chamfered Shape',
    },
  },

  params: {
    symmetric: BoolParam({ default: true, label: 'Symmetric' }),
    edgeSelection: {
      type: 'enum' as const,
      default: 'manual',
      options: [
        { value: 'manual', label: 'Manual' },
        { value: 'all', label: 'All Edges' },
      ],
      label: 'Edge Selection',
    },
  },

  evaluate: async (ctx, inputs, params) => {
    const result = await ctx.geom.invoke('CHAMFER_EDGES', {
      shape: inputs.shape,
      edges: inputs.edges,
      distance1: inputs.distance1,
      distance2: inputs.distance2 || inputs.distance1,
      symmetric: params.symmetric,
      edgeSelection: params.edgeSelection,
    });
    return { shape: result };
  },
};

export const BlendCorners = {
  type: 'Features::BlendCorners',
  category: 'Features',
  description: 'Blend corners with smooth transitions',
  icon: 'Features::Fillet',

  inputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Shape',
    },
    vertices: {
      type: 'Shape' as SocketType,
      label: 'Vertices',
      multiple: true,
    },
    radius: {
      type: 'Number' as SocketType,
      label: 'Blend Radius',
    },
    continuity: {
      type: 'Number' as SocketType,
      label: 'Continuity',
      optional: true,
    },
  },

  outputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Blended Shape',
    },
  },

  params: {
    blendType: {
      type: 'enum' as const,
      default: 'spherical',
      options: [
        { value: 'spherical', label: 'Spherical' },
        { value: 'continuous', label: 'Continuous' },
      ],
      label: 'Blend Type',
    },
  },

  evaluate: async (ctx, inputs, params) => {
    const result = await ctx.geom.invoke('BLEND_CORNERS', {
      shape: inputs.shape,
      vertices: inputs.vertices,
      radius: inputs.radius,
      continuity: inputs.continuity || 1,
      blendType: params.blendType,
    });
    return { shape: result };
  },
};

export const VariableRadiusFillet = {
  type: 'Features::VariableRadiusFillet',
  category: 'Features',
  description: 'Apply fillets with varying radius along edges',
  icon: 'Features::Fillet',

  inputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Shape',
    },
    edges: {
      type: 'Shape' as SocketType,
      label: 'Edges',
      multiple: true,
    },
  },

  outputs: {
    shape: {
      type: 'Shape' as SocketType,
      label: 'Filleted Shape',
    },
  },

  params: {
    startRadius: NumberParam({ default: 2.0, min: 0.01, label: 'Start Radius' }),
    endRadius: NumberParam({ default: 5.0, min: 0.01, label: 'End Radius' }),
    interpolation: StringParam({ default: 'linear', label: 'Interpolation' }),
  },

  evaluate: async (ctx, inputs, params) => {
    const result = await ctx.geom.invoke('VARIABLE_RADIUS_FILLET', {
      shape: inputs.shape,
      edges: inputs.edges,
      startRadius: params.startRadius,
      endRadius: params.endRadius,
      interpolation: params.interpolation,
    });
    return { shape: result };
  },
};
