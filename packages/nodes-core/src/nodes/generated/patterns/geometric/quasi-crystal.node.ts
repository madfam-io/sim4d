import type { NodeDefinition } from '@brepflow/types';

interface QuasiCrystalParams {
  symmetry: number;
  waves: number;
}

interface QuasiCrystalInputs {
  boundary: unknown;
}

interface QuasiCrystalOutputs {
  pattern: unknown;
}

export const PatternsGeometricQuasiCrystalNode: NodeDefinition<
  QuasiCrystalInputs,
  QuasiCrystalOutputs,
  QuasiCrystalParams
> = {
  id: 'Patterns::QuasiCrystal',
  category: 'Patterns',
  label: 'QuasiCrystal',
  description: 'Quasicrystalline pattern',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
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
    symmetry: {
      type: 'number',
      label: 'Symmetry',
      default: 5,
      min: 5,
      max: 12,
      step: 1,
    },
    waves: {
      type: 'number',
      label: 'Waves',
      default: 4,
      min: 3,
      max: 8,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'quasiCrystal',
      params: {
        boundary: inputs.boundary,
        symmetry: params.symmetry,
        waves: params.waves,
      },
    });

    return {
      pattern: result,
    };
  },
};
