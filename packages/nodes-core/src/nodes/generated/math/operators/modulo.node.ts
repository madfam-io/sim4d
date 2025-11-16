import type { NodeDefinition } from '@brepflow/types';

type ModuloParams = Record<string, never>;

interface ModuloInputs {
  a: unknown;
  b: unknown;
}

interface ModuloOutputs {
  result: unknown;
}

export const MathOperatorsModuloNode: NodeDefinition<ModuloInputs, ModuloOutputs, ModuloParams> = {
  id: 'Math::Modulo',
  category: 'Math',
  label: 'Modulo',
  description: 'Modulo operation',
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
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathModulo',
      params: {
        a: inputs.a,
        b: inputs.b,
      },
    });

    return {
      result: result,
    };
  },
};
