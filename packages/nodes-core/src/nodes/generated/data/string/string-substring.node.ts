import type { NodeDefinition } from '@brepflow/types';

type StringSubstringParams = Record<string, never>;

interface StringSubstringInputs {
  string: unknown;
  start: unknown;
  length?: unknown;
}

interface StringSubstringOutputs {
  substring: unknown;
}

export const DataStringStringSubstringNode: NodeDefinition<
  StringSubstringInputs,
  StringSubstringOutputs,
  StringSubstringParams
> = {
  id: 'Data::StringSubstring',
  category: 'Data',
  label: 'StringSubstring',
  description: 'Extract substring',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
    start: {
      type: 'number',
      label: 'Start',
      required: true,
    },
    length: {
      type: 'number',
      label: 'Length',
      optional: true,
    },
  },
  outputs: {
    substring: {
      type: 'string',
      label: 'Substring',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringSubstring',
      params: {
        string: inputs.string,
        start: inputs.start,
        length: inputs.length,
      },
    });

    return {
      substring: result,
    };
  },
};
