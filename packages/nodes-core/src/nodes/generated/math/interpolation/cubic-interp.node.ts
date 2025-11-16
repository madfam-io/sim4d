import type { NodeDefinition } from '@brepflow/types';

type CubicInterpParams = Record<string, never>;

interface CubicInterpInputs {
  v0: unknown;
  v1: unknown;
  v2: unknown;
  v3: unknown;
  t: unknown;
}

interface CubicInterpOutputs {
  result: unknown;
}

export const MathInterpolationCubicInterpNode: NodeDefinition<
  CubicInterpInputs,
  CubicInterpOutputs,
  CubicInterpParams
> = {
  id: 'Math::CubicInterp',
  category: 'Math',
  label: 'CubicInterp',
  description: 'Cubic interpolation',
  inputs: {
    v0: {
      type: 'number',
      label: 'V0',
      required: true,
    },
    v1: {
      type: 'number',
      label: 'V1',
      required: true,
    },
    v2: {
      type: 'number',
      label: 'V2',
      required: true,
    },
    v3: {
      type: 'number',
      label: 'V3',
      required: true,
    },
    t: {
      type: 'number',
      label: 'T',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathCubicInterp',
      params: {
        v0: inputs.v0,
        v1: inputs.v1,
        v2: inputs.v2,
        v3: inputs.v3,
        t: inputs.t,
      },
    });

    return {
      result: result,
    };
  },
};
