import type { NodeDefinition } from '@brepflow/types';

type ToBase64Params = Record<string, never>;

interface ToBase64Inputs {
  data: unknown;
}

interface ToBase64Outputs {
  base64: unknown;
}

export const DataConvertToBase64Node: NodeDefinition<
  ToBase64Inputs,
  ToBase64Outputs,
  ToBase64Params
> = {
  id: 'Data::ToBase64',
  category: 'Data',
  label: 'ToBase64',
  description: 'Encode to Base64',
  inputs: {
    data: {
      type: 'Data',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    base64: {
      type: 'string',
      label: 'Base64',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convertToBase64',
      params: {
        data: inputs.data,
      },
    });

    return {
      base64: result,
    };
  },
};
