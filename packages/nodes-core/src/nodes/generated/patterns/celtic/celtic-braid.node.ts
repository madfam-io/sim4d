import type { NodeDefinition } from '@brepflow/types';

interface CelticBraidParams {
  strands: number;
  crossings: number;
}

interface CelticBraidInputs {
  centerline: unknown;
}

interface CelticBraidOutputs {
  braid: unknown;
}

export const PatternsCelticCelticBraidNode: NodeDefinition<
  CelticBraidInputs,
  CelticBraidOutputs,
  CelticBraidParams
> = {
  id: 'Patterns::CelticBraid',
  category: 'Patterns',
  label: 'CelticBraid',
  description: 'Celtic braid pattern',
  inputs: {
    centerline: {
      type: 'Wire',
      label: 'Centerline',
      required: true,
    },
  },
  outputs: {
    braid: {
      type: 'Wire[]',
      label: 'Braid',
    },
  },
  params: {
    strands: {
      type: 'number',
      label: 'Strands',
      default: 3,
      min: 2,
      max: 8,
      step: 1,
    },
    crossings: {
      type: 'number',
      label: 'Crossings',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'celticBraid',
      params: {
        centerline: inputs.centerline,
        strands: params.strands,
        crossings: params.crossings,
      },
    });

    return {
      braid: result,
    };
  },
};
