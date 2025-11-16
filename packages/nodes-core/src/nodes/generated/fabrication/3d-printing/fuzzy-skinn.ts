import type { NodeDefinition } from '@brepflow/types';

interface FuzzySkinnParams {
  thickness: number;
  pointDistance: number;
}

interface FuzzySkinnInputs {
  perimeters: unknown;
}

interface FuzzySkinnOutputs {
  fuzzyPerimeters: unknown;
}

export const Fabrication3DPrintingFuzzySkinnNode: NodeDefinition<
  FuzzySkinnInputs,
  FuzzySkinnOutputs,
  FuzzySkinnParams
> = {
  id: 'Fabrication::FuzzySkinn',
  type: 'Fabrication::FuzzySkinn',
  category: 'Fabrication',
  label: 'FuzzySkinn',
  description: 'Generate fuzzy skin texture',
  inputs: {
    perimeters: {
      type: 'Wire[]',
      label: 'Perimeters',
      required: true,
    },
  },
  outputs: {
    fuzzyPerimeters: {
      type: 'Wire[]',
      label: 'Fuzzy Perimeters',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 0.3,
      min: 0.1,
      max: 1,
    },
    pointDistance: {
      type: 'number',
      label: 'Point Distance',
      default: 0.75,
      min: 0.1,
      max: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fuzzySkin',
      params: {
        perimeters: inputs.perimeters,
        thickness: params.thickness,
        pointDistance: params.pointDistance,
      },
    });

    return {
      fuzzyPerimeters: result,
    };
  },
};
