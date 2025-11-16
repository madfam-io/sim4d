import type { NodeDefinition, ShapeHandle } from '@brepflow/types';

export const UnionNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { shape: ShapeHandle },
  { simplify?: boolean }
> = {
  id: 'Boolean::Union',
  category: 'Boolean',
  label: 'Union',
  description: 'Boolean union of multiple shapes',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    simplify: {
      type: 'boolean',
      label: 'Simplify',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.shapes || inputs.shapes.length < 2) {
      throw new Error('Union requires at least 2 shapes');
    }

    const result = await ctx.worker.invoke('BOOLEAN_UNION', {
      shapes: inputs.shapes,
      simplify: params.simplify,
    });
    return { shape: result };
  },
};

export const SubtractNode: NodeDefinition<
  { base: ShapeHandle; tools: ShapeHandle[] },
  { shape: ShapeHandle },
  { simplify?: boolean }
> = {
  id: 'Boolean::Subtract',
  category: 'Boolean',
  label: 'Subtract',
  description: 'Boolean subtraction',
  inputs: {
    base: { type: 'Shape' },
    tools: { type: 'Shape', multiple: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    simplify: {
      type: 'boolean',
      label: 'Simplify',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.tools || inputs.tools.length === 0) {
      return { shape: inputs.base };
    }

    const result = await ctx.worker.invoke('BOOLEAN_SUBTRACT', {
      base: inputs.base,
      tools: inputs.tools,
      simplify: params.simplify,
    });
    return { shape: result };
  },
};

export const IntersectNode: NodeDefinition<
  { shapes: ShapeHandle[] },
  { shape: ShapeHandle },
  { simplify?: boolean }
> = {
  id: 'Boolean::Intersect',
  category: 'Boolean',
  label: 'Intersect',
  description: 'Boolean intersection of shapes',
  inputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    simplify: {
      type: 'boolean',
      label: 'Simplify',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.shapes || inputs.shapes.length < 2) {
      throw new Error('Intersect requires at least 2 shapes');
    }

    const result = await ctx.worker.invoke('BOOLEAN_INTERSECT', {
      shapes: inputs.shapes,
      simplify: params.simplify,
    });
    return { shape: result };
  },
};

export const booleanNodes = [UnionNode, SubtractNode, IntersectNode];
