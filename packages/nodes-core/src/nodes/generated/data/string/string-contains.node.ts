import type { NodeDefinition } from '@sim4d/types';

interface StringContainsParams {
  caseSensitive: boolean;
}

interface StringContainsInputs {
  string: unknown;
  search: unknown;
}

interface StringContainsOutputs {
  contains: unknown;
  index: unknown;
}

export const DataStringStringContainsNode: NodeDefinition<
  StringContainsInputs,
  StringContainsOutputs,
  StringContainsParams
> = {
  id: 'Data::StringContains',
  category: 'Data',
  label: 'StringContains',
  description: 'Check if contains',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
    search: {
      type: 'string',
      label: 'Search',
      required: true,
    },
  },
  outputs: {
    contains: {
      type: 'boolean',
      label: 'Contains',
    },
    index: {
      type: 'number',
      label: 'Index',
    },
  },
  params: {
    caseSensitive: {
      type: 'boolean',
      label: 'Case Sensitive',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stringContains',
      params: {
        string: inputs.string,
        search: inputs.search,
        caseSensitive: params.caseSensitive,
      },
    });

    return {
      contains: results.contains,
      index: results.index,
    };
  },
};
