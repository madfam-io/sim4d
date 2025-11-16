import type { NodeDefinition } from '@brepflow/types';

type FromBase64Params = Record<string, never>;

interface FromBase64Inputs {
  base64: unknown;
}

interface FromBase64Outputs {
  data: unknown;
}

export const DataConvertFromBase64Node: NodeDefinition<
  FromBase64Inputs,
  FromBase64Outputs,
  FromBase64Params
> = {
  id: 'Data::FromBase64',
  category: 'Data',
  label: 'FromBase64',
  description: 'Decode from Base64',
  inputs: {
    base64: {
      type: 'string',
      label: 'Base64',
      required: true,
    },
  },
  outputs: {
    data: {
      type: 'Data',
      label: 'Data',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convertFromBase64',
      params: {
        base64: inputs.base64,
      },
    });

    return {
      data: result,
    };
  },
};
