import { NodeDefinition } from '@brepflow/types';

type Params = {};
interface Inputs {
  json: string;
}
interface Outputs {
  data: Data;
  isValid: boolean;
}

export const FromJSONNode: NodeDefinition<FromJSONInputs, FromJSONOutputs, FromJSONParams> = {
  type: 'Data::FromJSON',
  category: 'Data',
  subcategory: 'Convert',

  metadata: {
    label: 'FromJSON',
    description: 'Parse JSON',
  },

  params: {},

  inputs: {
    json: 'string',
  },

  outputs: {
    data: 'Data',
    isValid: 'boolean',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convertFromJSON',
      params: {
        json: inputs.json,
      },
    });

    return {
      data: result,
      isValid: result,
    };
  },
};
