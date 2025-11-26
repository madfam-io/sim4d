import type { NodeDefinition } from '@sim4d/types';

interface StringMatchParams {
  global: boolean;
}

interface StringMatchInputs {
  string: unknown;
  pattern: unknown;
}

interface StringMatchOutputs {
  matches: unknown;
}

export const DataStringStringMatchNode: NodeDefinition<
  StringMatchInputs,
  StringMatchOutputs,
  StringMatchParams
> = {
  id: 'Data::StringMatch',
  type: 'Data::StringMatch',
  category: 'Data',
  label: 'StringMatch',
  description: 'Match with regex',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
    pattern: {
      type: 'string',
      label: 'Pattern',
      required: true,
    },
  },
  outputs: {
    matches: {
      type: 'string[]',
      label: 'Matches',
    },
  },
  params: {
    global: {
      type: 'boolean',
      label: 'Global',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringMatch',
      params: {
        string: inputs.string,
        pattern: inputs.pattern,
        global: params.global,
      },
    });

    return {
      matches: result,
    };
  },
};
