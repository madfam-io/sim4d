import type { NodeDefinition } from '@sim4d/types';

type StringLengthParams = Record<string, never>;

interface StringLengthInputs {
  string: unknown;
}

interface StringLengthOutputs {
  length: unknown;
}

export const DataStringStringLengthNode: NodeDefinition<
  StringLengthInputs,
  StringLengthOutputs,
  StringLengthParams
> = {
  id: 'Data::StringLength',
  type: 'Data::StringLength',
  category: 'Data',
  label: 'StringLength',
  description: 'String length',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
  },
  outputs: {
    length: {
      type: 'number',
      label: 'Length',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringLength',
      params: {
        string: inputs.string,
      },
    });

    return {
      length: result,
    };
  },
};
