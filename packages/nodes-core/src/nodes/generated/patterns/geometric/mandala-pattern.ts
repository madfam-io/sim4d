import type { NodeDefinition } from '@sim4d/types';

interface MandalaPatternParams {
  rings: number;
  symmetry: number;
  complexity: number;
}

interface MandalaPatternInputs {
  center: [number, number, number];
}

interface MandalaPatternOutputs {
  mandala: unknown;
}

export const PatternsGeometricMandalaPatternNode: NodeDefinition<
  MandalaPatternInputs,
  MandalaPatternOutputs,
  MandalaPatternParams
> = {
  id: 'Patterns::MandalaPattern',
  type: 'Patterns::MandalaPattern',
  category: 'Patterns',
  label: 'MandalaPattern',
  description: 'Mandala circular pattern',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    mandala: {
      type: 'Wire[]',
      label: 'Mandala',
    },
  },
  params: {
    rings: {
      type: 'number',
      label: 'Rings',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
    symmetry: {
      type: 'number',
      label: 'Symmetry',
      default: 8,
      min: 3,
      max: 24,
      step: 1,
    },
    complexity: {
      type: 'number',
      label: 'Complexity',
      default: 3,
      min: 1,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mandalaPattern',
      params: {
        center: inputs.center,
        rings: params.rings,
        symmetry: params.symmetry,
        complexity: params.complexity,
      },
    });

    return {
      mandala: result,
    };
  },
};
