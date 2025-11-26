import type { NodeDefinition } from '@sim4d/types';

type TypeOfParams = Record<string, never>;

interface TypeOfInputs {
  data: unknown;
}

interface TypeOfOutputs {
  type: unknown;
}

export const DataConvertTypeOfNode: NodeDefinition<TypeOfInputs, TypeOfOutputs, TypeOfParams> = {
  id: 'Data::TypeOf',
  category: 'Data',
  label: 'TypeOf',
  description: 'Get data type',
  inputs: {
    data: {
      type: 'Data',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    type: {
      type: 'string',
      label: 'Type',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'typeOf',
      params: {
        data: inputs.data,
      },
    });

    return {
      type: result,
    };
  },
};
