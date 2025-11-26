import type { NodeDefinition } from '@sim4d/types';

interface MoorishPatternParams {
  style: string;
  scale: number;
}

interface MoorishPatternInputs {
  region: unknown;
}

interface MoorishPatternOutputs {
  pattern: unknown;
}

export const PatternsIslamicMoorishPatternNode: NodeDefinition<
  MoorishPatternInputs,
  MoorishPatternOutputs,
  MoorishPatternParams
> = {
  id: 'Patterns::MoorishPattern',
  type: 'Patterns::MoorishPattern',
  category: 'Patterns',
  label: 'MoorishPattern',
  description: 'Moorish geometric pattern',
  inputs: {
    region: {
      type: 'Face',
      label: 'Region',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    style: {
      type: 'enum',
      label: 'Style',
      default: 'alhambra',
      options: ['alhambra', 'cordoba', 'seville', 'granada'],
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'moorishPattern',
      params: {
        region: inputs.region,
        style: params.style,
        scale: params.scale,
      },
    });

    return {
      pattern: result,
    };
  },
};
