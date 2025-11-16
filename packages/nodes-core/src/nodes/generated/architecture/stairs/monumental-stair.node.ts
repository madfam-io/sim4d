import type { NodeDefinition } from '@brepflow/types';

interface MonumentalStairParams {
  style: string;
  width: number;
}

interface MonumentalStairInputs {
  footprint: unknown;
}

interface MonumentalStairOutputs {
  monumentalStair: unknown;
}

export const ArchitectureStairsMonumentalStairNode: NodeDefinition<
  MonumentalStairInputs,
  MonumentalStairOutputs,
  MonumentalStairParams
> = {
  id: 'Architecture::MonumentalStair',
  category: 'Architecture',
  label: 'MonumentalStair',
  description: 'Grand monumental staircase',
  inputs: {
    footprint: {
      type: 'Wire',
      label: 'Footprint',
      required: true,
    },
  },
  outputs: {
    monumentalStair: {
      type: 'Shape',
      label: 'Monumental Stair',
    },
  },
  params: {
    style: {
      type: 'enum',
      label: 'Style',
      default: 'imperial',
      options: ['imperial', 'bifurcated', 'horseshoe'],
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 3000,
      min: 2000,
      max: 6000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'monumentalStair',
      params: {
        footprint: inputs.footprint,
        style: params.style,
        width: params.width,
      },
    });

    return {
      monumentalStair: result,
    };
  },
};
