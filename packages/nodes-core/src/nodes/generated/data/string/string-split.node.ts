import type { NodeDefinition } from '@sim4d/types';

interface StringSplitParams {
  delimiter: string;
}

interface StringSplitInputs {
  string: unknown;
}

interface StringSplitOutputs {
  parts: unknown;
}

export const DataStringStringSplitNode: NodeDefinition<
  StringSplitInputs,
  StringSplitOutputs,
  StringSplitParams
> = {
  id: 'Data::StringSplit',
  category: 'Data',
  label: 'StringSplit',
  description: 'Split string',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
  },
  outputs: {
    parts: {
      type: 'string[]',
      label: 'Parts',
    },
  },
  params: {
    delimiter: {
      type: 'string',
      label: 'Delimiter',
      default: ',',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringSplit',
      params: {
        string: inputs.string,
        delimiter: params.delimiter,
      },
    });

    return {
      parts: result,
    };
  },
};
