import type { NodeDefinition } from '@sim4d/types';

interface StringReplaceParams {
  global: boolean;
}

interface StringReplaceInputs {
  string: unknown;
  search: unknown;
  replace: unknown;
}

interface StringReplaceOutputs {
  result: unknown;
}

export const DataStringStringReplaceNode: NodeDefinition<
  StringReplaceInputs,
  StringReplaceOutputs,
  StringReplaceParams
> = {
  id: 'Data::StringReplace',
  category: 'Data',
  label: 'StringReplace',
  description: 'Replace in string',
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
    replace: {
      type: 'string',
      label: 'Replace',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'string',
      label: 'Result',
    },
  },
  params: {
    global: {
      type: 'boolean',
      label: 'Global',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringReplace',
      params: {
        string: inputs.string,
        search: inputs.search,
        replace: inputs.replace,
        global: params.global,
      },
    });

    return {
      result: result,
    };
  },
};
