import type { NodeDefinition } from '@brepflow/types';

type SmoothStepParams = Record<string, never>;

interface SmoothStepInputs {
  edge0: unknown;
  edge1: unknown;
  x: unknown;
}

interface SmoothStepOutputs {
  result: unknown;
}

export const MathInterpolationSmoothStepNode: NodeDefinition<
  SmoothStepInputs,
  SmoothStepOutputs,
  SmoothStepParams
> = {
  id: 'Math::SmoothStep',
  type: 'Math::SmoothStep',
  category: 'Math',
  label: 'SmoothStep',
  description: 'Smooth step interpolation',
  inputs: {
    edge0: {
      type: 'number',
      label: 'Edge0',
      required: true,
    },
    edge1: {
      type: 'number',
      label: 'Edge1',
      required: true,
    },
    x: {
      type: 'number',
      label: 'X',
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
      type: 'mathSmoothStep',
      params: {
        edge0: inputs.edge0,
        edge1: inputs.edge1,
        x: inputs.x,
      },
    });

    return {
      result: result,
    };
  },
};
