import type { NodeDefinition } from '@sim4d/types';

interface StairBalustradeParams {
  style: string;
  spacing: number;
}

interface StairBalustradeInputs {
  stairSide: unknown;
}

interface StairBalustradeOutputs {
  balustrade: unknown;
}

export const ArchitectureStairsStairBalustradeNode: NodeDefinition<
  StairBalustradeInputs,
  StairBalustradeOutputs,
  StairBalustradeParams
> = {
  id: 'Architecture::StairBalustrade',
  category: 'Architecture',
  label: 'StairBalustrade',
  description: 'Stair balustrade system',
  inputs: {
    stairSide: {
      type: 'Wire',
      label: 'Stair Side',
      required: true,
    },
  },
  outputs: {
    balustrade: {
      type: 'Shape',
      label: 'Balustrade',
    },
  },
  params: {
    style: {
      type: 'enum',
      label: 'Style',
      default: 'vertical',
      options: ['vertical', 'horizontal', 'glass', 'cable'],
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 100,
      min: 75,
      max: 125,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stairBalustrade',
      params: {
        stairSide: inputs.stairSide,
        style: params.style,
        spacing: params.spacing,
      },
    });

    return {
      balustrade: result,
    };
  },
};
