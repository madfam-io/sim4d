import type { NodeDefinition } from '@brepflow/types';

type FromJSONParams = Record<string, never>;

interface FromJSONInputs {
  json: unknown;
}

interface FromJSONOutputs {
  data: unknown;
  isValid: unknown;
}

export const DataConvertFromJSONNode: NodeDefinition<
  FromJSONInputs,
  FromJSONOutputs,
  FromJSONParams
> = {
  id: 'Data::FromJSON',
  category: 'Data',
  label: 'FromJSON',
  description: 'Parse JSON',
  inputs: {
    json: {
      type: 'string',
      label: 'Json',
      required: true,
    },
  },
  outputs: {
    data: {
      type: 'Data',
      label: 'Data',
    },
    isValid: {
      type: 'boolean',
      label: 'Is Valid',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'convertFromJSON',
      params: {
        json: inputs.json,
      },
    });

    return {
      data: results.data,
      isValid: results.isValid,
    };
  },
};
