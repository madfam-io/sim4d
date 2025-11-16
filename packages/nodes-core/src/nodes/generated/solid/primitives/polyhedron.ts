import type { NodeDefinition } from '@brepflow/types';

interface PolyhedronParams {
  type: string;
  size: number;
}

type PolyhedronInputs = Record<string, never>;

interface PolyhedronOutputs {
  solid: unknown;
}

export const SolidPrimitivesPolyhedronNode: NodeDefinition<
  PolyhedronInputs,
  PolyhedronOutputs,
  PolyhedronParams
> = {
  id: 'Solid::Polyhedron',
  type: 'Solid::Polyhedron',
  category: 'Solid',
  label: 'Polyhedron',
  description: 'Create a regular polyhedron',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'octahedron',
      options: ['tetrahedron', 'octahedron', 'dodecahedron', 'icosahedron'],
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 50,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePolyhedron',
      params: {
        type: params.type,
        size: params.size,
      },
    });

    return {
      solid: result,
    };
  },
};
