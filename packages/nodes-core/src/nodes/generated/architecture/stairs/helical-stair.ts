import type { NodeDefinition } from '@sim4d/types';

interface HelicalStairParams {
  innerRadius: number;
  outerRadius: number;
  totalRise: number;
}

interface HelicalStairInputs {
  centerPoint: [number, number, number];
}

interface HelicalStairOutputs {
  helicalStair: unknown;
}

export const ArchitectureStairsHelicalStairNode: NodeDefinition<
  HelicalStairInputs,
  HelicalStairOutputs,
  HelicalStairParams
> = {
  id: 'Architecture::HelicalStair',
  type: 'Architecture::HelicalStair',
  category: 'Architecture',
  label: 'HelicalStair',
  description: 'Helical staircase',
  inputs: {
    centerPoint: {
      type: 'Point',
      label: 'Center Point',
      required: true,
    },
  },
  outputs: {
    helicalStair: {
      type: 'Shape',
      label: 'Helical Stair',
    },
  },
  params: {
    innerRadius: {
      type: 'number',
      label: 'Inner Radius',
      default: 500,
      min: 0,
      max: 1000,
    },
    outerRadius: {
      type: 'number',
      label: 'Outer Radius',
      default: 1500,
      min: 1000,
      max: 3000,
    },
    totalRise: {
      type: 'number',
      label: 'Total Rise',
      default: 3000,
      min: 1000,
      max: 6000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'helicalStair',
      params: {
        centerPoint: inputs.centerPoint,
        innerRadius: params.innerRadius,
        outerRadius: params.outerRadius,
        totalRise: params.totalRise,
      },
    });

    return {
      helicalStair: result,
    };
  },
};
