import type { NodeDefinition } from '@brepflow/types';

interface ToJSONParams {
  pretty: boolean;
}

interface ToJSONInputs {
  data: unknown;
}

interface ToJSONOutputs {
  json: unknown;
}

export const DataConvertToJSONNode: NodeDefinition<ToJSONInputs, ToJSONOutputs, ToJSONParams> = {
  id: 'Data::ToJSON',
  type: 'Data::ToJSON',
  category: 'Data',
  label: 'ToJSON',
  description: 'Convert to JSON',
  inputs: {
    data: {
      type: 'Data',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    json: {
      type: 'string',
      label: 'Json',
    },
  },
  params: {
    pretty: {
      type: 'boolean',
      label: 'Pretty',
      default: false,
    },
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
