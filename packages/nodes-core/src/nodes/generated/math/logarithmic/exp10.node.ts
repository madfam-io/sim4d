import type { NodeDefinition } from '@sim4d/types';

type Exp10Params = Record<string, never>;

interface Exp10Inputs {
  value: unknown;
}

interface Exp10Outputs {
  result: unknown;
}

export const MathLogarithmicExp10Node: NodeDefinition<Exp10Inputs, Exp10Outputs, Exp10Params> = {
  id: 'Math::Exp10',
  category: 'Math',
  label: 'Exp10',
  description: '10 raised to power',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
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
      type: 'mathExp10',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
