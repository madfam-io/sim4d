import type { NodeDefinition } from '@sim4d/types';

interface IslamicGridParams {
  gridType: string;
  spacing: number;
}

interface IslamicGridInputs {
  boundary: unknown;
}

interface IslamicGridOutputs {
  grid: unknown;
}

export const PatternsIslamicIslamicGridNode: NodeDefinition<
  IslamicGridInputs,
  IslamicGridOutputs,
  IslamicGridParams
> = {
  id: 'Patterns::IslamicGrid',
  category: 'Patterns',
  label: 'IslamicGrid',
  description: 'Islamic grid system',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    grid: {
      type: 'Wire[]',
      label: 'Grid',
    },
  },
  params: {
    gridType: {
      type: 'enum',
      label: 'Grid Type',
      default: 'octagonal',
      options: ['square', 'hexagonal', 'octagonal'],
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'islamicGrid',
      params: {
        boundary: inputs.boundary,
        gridType: params.gridType,
        spacing: params.spacing,
      },
    });

    return {
      grid: result,
    };
  },
};
