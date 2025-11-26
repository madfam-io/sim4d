import { NodeDefinition } from '@sim4d/types';

interface Params {
  path: string;
  flatten: boolean;
}
interface Inputs {
  jsonData: string;
}
interface Outputs {
  data: Properties;
  arrays: Properties[];
  values: string[];
}

export const JSONParserNode: NodeDefinition<JSONParserInputs, JSONParserOutputs, JSONParserParams> =
  {
    type: 'Interoperability::JSONParser',
    category: 'Interoperability',
    subcategory: 'API',

    metadata: {
      label: 'JSONParser',
      description: 'Parse JSON data structures',
    },

    params: {
      path: {
        default: '',
        description: 'JSONPath expression',
      },
      flatten: {
        default: false,
        description: 'Flatten nested objects',
      },
    },

    inputs: {
      jsonData: 'string',
    },

    outputs: {
      data: 'Properties',
      arrays: 'Properties[]',
      values: 'string[]',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'jsonParser',
        params: {
          jsonData: inputs.jsonData,
          path: params.path,
          flatten: params.flatten,
        },
      });

      return {
        data: result,
        arrays: result,
        values: result,
      };
    },
  };
