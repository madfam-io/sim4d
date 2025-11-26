import { NodeDefinition } from '@sim4d/types';

interface Params {
  pretty: boolean;
}
interface Inputs {
  data: Data;
}
interface Outputs {
  json: string;
}

export const ToJSONNode: NodeDefinition<ToJSONInputs, ToJSONOutputs, ToJSONParams> = {
  type: 'Data::ToJSON',
  category: 'Data',
  subcategory: 'Convert',

  metadata: {
    label: 'ToJSON',
    description: 'Convert to JSON',
  },

  params: {
    pretty: {
      default: false,
    },
  },

  inputs: {
    data: 'Data',
  },

  outputs: {
    json: 'string',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convertToJSON',
      params: {
        data: inputs.data,
        pretty: params.pretty,
      },
    });

    return {
      json: result,
    };
  },
};
