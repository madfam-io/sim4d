import type { NodeDefinition } from '@brepflow/types';

type ListLengthParams = Record<string, never>;

interface ListLengthInputs {
  list: unknown;
}

interface ListLengthOutputs {
  length: unknown;
}

export const DataListListLengthNode: NodeDefinition<
  ListLengthInputs,
  ListLengthOutputs,
  ListLengthParams
> = {
  id: 'Data::ListLength',
  category: 'Data',
  label: 'ListLength',
  description: 'Get list length',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
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
      type: 'listLength',
      params: {
        list: inputs.list,
      },
    });

    return {
      length: result,
    };
  },
};
