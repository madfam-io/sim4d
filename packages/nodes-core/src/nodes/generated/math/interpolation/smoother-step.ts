import type { NodeDefinition } from '@brepflow/types';

type SmootherStepParams = Record<string, never>;

interface SmootherStepInputs {
  edge0: unknown;
  edge1: unknown;
  x: unknown;
}

interface SmootherStepOutputs {
  result: unknown;
}

export const MathInterpolationSmootherStepNode: NodeDefinition<
  SmootherStepInputs,
  SmootherStepOutputs,
  SmootherStepParams
> = {
  id: 'Math::SmootherStep',
  type: 'Math::SmootherStep',
  category: 'Math',
  label: 'SmootherStep',
  description: 'Smoother step interpolation',
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
      type: 'mathSmootherStep',
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
