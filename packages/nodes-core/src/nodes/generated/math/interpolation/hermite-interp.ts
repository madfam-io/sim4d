import type { NodeDefinition } from '@brepflow/types';

type HermiteInterpParams = Record<string, never>;

interface HermiteInterpInputs {
  p0: unknown;
  p1: unknown;
  m0: unknown;
  m1: unknown;
  t: unknown;
}

interface HermiteInterpOutputs {
  result: unknown;
}

export const MathInterpolationHermiteInterpNode: NodeDefinition<
  HermiteInterpInputs,
  HermiteInterpOutputs,
  HermiteInterpParams
> = {
  id: 'Math::HermiteInterp',
  type: 'Math::HermiteInterp',
  category: 'Math',
  label: 'HermiteInterp',
  description: 'Hermite interpolation',
  inputs: {
    p0: {
      type: 'number',
      label: 'P0',
      required: true,
    },
    p1: {
      type: 'number',
      label: 'P1',
      required: true,
    },
    m0: {
      type: 'number',
      label: 'M0',
      required: true,
    },
    m1: {
      type: 'number',
      label: 'M1',
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
      type: 'mathHermiteInterp',
      params: {
        p0: inputs.p0,
        p1: inputs.p1,
        m0: inputs.m0,
        m1: inputs.m1,
        t: inputs.t,
      },
    });

    return {
      result: result,
    };
  },
};
