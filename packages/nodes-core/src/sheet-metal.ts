import type { NodeDefinition, ShapeHandle, Vec3 } from '@brepflow/types';

/**
 * Sheet Metal Base Flange Node
 * Creates a base flange/tab from a sketch profile
 */
export const BaseFlangeNode: NodeDefinition<
  { profile: ShapeHandle },
  { shape: ShapeHandle },
  { thickness: number; direction: 'up' | 'down' | 'mid-plane'; bendRadius: number }
> = {
  id: 'SheetMetal::BaseFlange',
  name: 'Base Flange',
  description: 'Create base sheet metal part from profile',
  category: 'SheetMetal',
  inputs: {
    profile: { type: 'Shape', description: 'Profile sketch' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Sheet metal base' },
  },
  params: {
    thickness: { type: 'number', default: 2, min: 0.1, description: 'Material thickness' },
    direction: {
      type: 'select',
      default: 'up',
      options: ['up', 'down', 'mid-plane'],
      description: 'Extrusion direction',
    },
    bendRadius: { type: 'number', default: 2, min: 0, description: 'Default bend radius' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_BASE_FLANGE', {
      profileId: inputs.profile.id,
      thickness: params.thickness,
      direction: params.direction,
      bendRadius: params.bendRadius,
    });
    return { shape: result };
  },
};

/**
 * Edge Flange Node
 * Adds a flange along an edge
 */
export const EdgeFlangeNode: NodeDefinition<
  { shape: ShapeHandle; edge: ShapeHandle },
  { shape: ShapeHandle },
  {
    angle: number;
    length: number;
    position: 'material-inside' | 'material-outside' | 'bend-outside';
  }
> = {
  id: 'SheetMetal::EdgeFlange',
  name: 'Edge Flange',
  description: 'Add flange along sheet metal edge',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    edge: { type: 'Shape', description: 'Edge for flange' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Updated part' },
  },
  params: {
    angle: { type: 'number', default: 90, min: 0, max: 180, description: 'Bend angle' },
    length: { type: 'number', default: 20, min: 0, description: 'Flange length' },
    position: {
      type: 'select',
      default: 'material-inside',
      options: ['material-inside', 'material-outside', 'bend-outside'],
      description: 'Bend position',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_EDGE_FLANGE', {
      shapeId: inputs.shape.id,
      edgeId: inputs.edge.id,
      angle: params.angle,
      length: params.length,
      position: params.position,
    });
    return { shape: result };
  },
};

/**
 * Hem Node
 * Creates a hem along an edge
 */
export const HemNode: NodeDefinition<
  { shape: ShapeHandle; edge: ShapeHandle },
  { shape: ShapeHandle },
  { type: 'closed' | 'open' | 'teardrop'; gap: number; length: number }
> = {
  id: 'SheetMetal::Hem',
  name: 'Hem',
  description: 'Create hem along edge',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    edge: { type: 'Shape', description: 'Edge to hem' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Hemmed part' },
  },
  params: {
    type: {
      type: 'select',
      default: 'closed',
      options: ['closed', 'open', 'teardrop'],
      description: 'Hem type',
    },
    gap: { type: 'number', default: 0.5, min: 0, description: 'Gap for open hem' },
    length: { type: 'number', default: 5, min: 0, description: 'Hem length' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_HEM', {
      shapeId: inputs.shape.id,
      edgeId: inputs.edge.id,
      type: params.type,
      gap: params.gap,
      length: params.length,
    });
    return { shape: result };
  },
};

/**
 * Miter Flange Node
 * Creates a miter flange from connected edges
 */
export const MiterFlangeNode: NodeDefinition<
  { shape: ShapeHandle; edges: ShapeHandle[] },
  { shape: ShapeHandle },
  { angle: number; length: number; miterGap: number }
> = {
  id: 'SheetMetal::MiterFlange',
  name: 'Miter Flange',
  description: 'Create miter flange from edges',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    edges: { type: 'Shape[]', description: 'Connected edges' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Updated part' },
  },
  params: {
    angle: { type: 'number', default: 90, min: 0, max: 180, description: 'Flange angle' },
    length: { type: 'number', default: 20, min: 0, description: 'Flange length' },
    miterGap: { type: 'number', default: 0.5, min: 0, description: 'Gap at miter' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_MITER_FLANGE', {
      shapeId: inputs.shape.id,
      edgeIds: inputs.edges.map((e) => e.id),
      angle: params.angle,
      length: params.length,
      miterGap: params.miterGap,
    });
    return { shape: result };
  },
};

/**
 * Bend Relief Node
 * Adds relief cuts for bends
 */
export const BendReliefNode: NodeDefinition<
  { shape: ShapeHandle; corner: ShapeHandle },
  { shape: ShapeHandle },
  { type: 'rectangular' | 'obround' | 'tear'; size: number; depth: number }
> = {
  id: 'SheetMetal::BendRelief',
  name: 'Bend Relief',
  description: 'Add relief cut at bend corner',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    corner: { type: 'Shape', description: 'Corner vertex' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Updated part' },
  },
  params: {
    type: {
      type: 'select',
      default: 'rectangular',
      options: ['rectangular', 'obround', 'tear'],
      description: 'Relief type',
    },
    size: { type: 'number', default: 2, min: 0, description: 'Relief size' },
    depth: { type: 'number', default: 5, min: 0, description: 'Relief depth' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_BEND_RELIEF', {
      shapeId: inputs.shape.id,
      cornerId: inputs.corner.id,
      type: params.type,
      size: params.size,
      depth: params.depth,
    });
    return { shape: result };
  },
};

/**
 * Corner Relief Node
 * Adds relief at sheet metal corners
 */
export const CornerReliefNode: NodeDefinition<
  { shape: ShapeHandle; corner: ShapeHandle },
  { shape: ShapeHandle },
  { type: 'circular' | 'square' | 'tear'; size: number }
> = {
  id: 'SheetMetal::CornerRelief',
  name: 'Corner Relief',
  description: 'Add corner relief',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    corner: { type: 'Shape', description: 'Corner to modify' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Updated part' },
  },
  params: {
    type: {
      type: 'select',
      default: 'circular',
      options: ['circular', 'square', 'tear'],
      description: 'Relief type',
    },
    size: { type: 'number', default: 2, min: 0, description: 'Relief size' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_CORNER_RELIEF', {
      shapeId: inputs.shape.id,
      cornerId: inputs.corner.id,
      type: params.type,
      size: params.size,
    });
    return { shape: result };
  },
};

/**
 * Unfold Node
 * Creates flat pattern of sheet metal part
 */
export const UnfoldNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle; bendTable: any },
  { kFactor: number }
> = {
  id: 'SheetMetal::Unfold',
  name: 'Unfold',
  description: 'Create flat pattern',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Flat pattern' },
    bendTable: { type: 'Data', description: 'Bend line information' },
  },
  params: {
    kFactor: {
      type: 'number',
      default: 0.44,
      min: 0,
      max: 1,
      description: 'K-Factor for bend allowance',
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_UNFOLD', {
      shapeId: inputs.shape.id,
      kFactor: params.kFactor,
    });
    return {
      shape: result.flatPattern,
      bendTable: result.bendTable,
    };
  },
};

/**
 * Form Tool Node
 * Creates formed features like louvers, lances, ribs
 */
export const FormToolNode: NodeDefinition<
  { shape: ShapeHandle; position: Vec3 },
  { shape: ShapeHandle },
  { type: 'louver' | 'lance' | 'rib' | 'dimple'; width: number; height: number; depth: number }
> = {
  id: 'SheetMetal::FormTool',
  name: 'Form Tool',
  description: 'Apply formed feature',
  category: 'SheetMetal',
  inputs: {
    shape: { type: 'Shape', description: 'Sheet metal part' },
    position: { type: 'Vec3', description: 'Feature position' },
  },
  outputs: {
    shape: { type: 'Shape', description: 'Updated part' },
  },
  params: {
    type: {
      type: 'select',
      default: 'louver',
      options: ['louver', 'lance', 'rib', 'dimple'],
      description: 'Form tool type',
    },
    width: { type: 'number', default: 10, min: 0, description: 'Feature width' },
    height: { type: 'number', default: 5, min: 0, description: 'Feature height' },
    depth: { type: 'number', default: 2, min: 0, description: 'Feature depth' },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('SHEET_FORM_TOOL', {
      shapeId: inputs.shape.id,
      position: inputs.position,
      type: params.type,
      width: params.width,
      height: params.height,
      depth: params.depth,
    });
    return { shape: result };
  },
};
