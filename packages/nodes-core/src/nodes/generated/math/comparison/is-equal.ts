import type { NodeDefinition } from '@sim4d/types';

interface IsEqualParams {
  tolerance: number;
}

interface IsEqualInputs {
  a: unknown;
  b: unknown;
}

interface IsEqualOutputs {
  equal: unknown;
}

export const MathComparisonIsEqualNode: NodeDefinition<
  IsEqualInputs,
  IsEqualOutputs,
  IsEqualParams
> = {
  id: 'Math::IsEqual',
  type: 'Math::IsEqual',
  category: 'Math',
  label: 'IsEqual',
  description: 'Check equality with tolerance',
  inputs: {
    a: {
      type: 'number',
      label: 'A',
      required: true,
    },
    b: {
      type: 'number',
      label: 'B',
      required: true,
    },
  },
  outputs: {
    equal: {
      type: 'boolean',
      label: 'Equal',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.0001,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathIsEqual',
      params: {
        a: inputs.a,
        b: inputs.b,
        tolerance: params.tolerance,
      },
    });

    return {
      equal: result,
    };
  },
};
