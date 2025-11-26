import type { NodeDefinition } from '@sim4d/types';

interface JSONParserParams {
  path: string;
  flatten: boolean;
}

interface JSONParserInputs {
  jsonData: unknown;
}

interface JSONParserOutputs {
  data: unknown;
  arrays: unknown;
  values: unknown;
}

export const InteroperabilityAPIJSONParserNode: NodeDefinition<
  JSONParserInputs,
  JSONParserOutputs,
  JSONParserParams
> = {
  id: 'Interoperability::JSONParser',
  type: 'Interoperability::JSONParser',
  category: 'Interoperability',
  label: 'JSONParser',
  description: 'Parse JSON data structures',
  inputs: {
    jsonData: {
      type: 'string',
      label: 'Json Data',
      required: true,
    },
  },
  outputs: {
    data: {
      type: 'Properties',
      label: 'Data',
    },
    arrays: {
      type: 'Properties[]',
      label: 'Arrays',
    },
    values: {
      type: 'string[]',
      label: 'Values',
    },
  },
  params: {
    path: {
      type: 'string',
      label: 'Path',
      default: '',
    },
    flatten: {
      type: 'boolean',
      label: 'Flatten',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'jsonParser',
      params: {
        jsonData: inputs.jsonData,
        path: params.path,
        flatten: params.flatten,
      },
    });

    return {
      data: results.data,
      arrays: results.arrays,
      values: results.values,
    };
  },
};
