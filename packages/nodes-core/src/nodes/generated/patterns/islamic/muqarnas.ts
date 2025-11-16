import type { NodeDefinition } from '@brepflow/types';

interface MuqarnasParams {
  levels: number;
  cellType: string;
}

interface MuqarnasInputs {
  base: unknown;
}

interface MuqarnasOutputs {
  muqarnas: unknown;
}

export const PatternsIslamicMuqarnasNode: NodeDefinition<
  MuqarnasInputs,
  MuqarnasOutputs,
  MuqarnasParams
> = {
  id: 'Patterns::Muqarnas',
  type: 'Patterns::Muqarnas',
  category: 'Patterns',
  label: 'Muqarnas',
  description: 'Muqarnas honeycomb pattern',
  inputs: {
    base: {
      type: 'Face',
      label: 'Base',
      required: true,
    },
  },
  outputs: {
    muqarnas: {
      type: 'Shape[]',
      label: 'Muqarnas',
    },
  },
  params: {
    levels: {
      type: 'number',
      label: 'Levels',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
    },
    cellType: {
      type: 'enum',
      label: 'Cell Type',
      default: 'mixed',
      options: ['square', 'octagonal', 'mixed'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'muqarnas',
      params: {
        base: inputs.base,
        levels: params.levels,
        cellType: params.cellType,
      },
    });

    return {
      muqarnas: result,
    };
  },
};
