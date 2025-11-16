import { NodeDefinition } from '@brepflow/types';

interface Params {
  indent: number;
  compact: boolean;
}
interface Inputs {
  data: Properties;
}
interface Outputs {
  json: string;
  size: number;
}

export const JSONGeneratorNode: NodeDefinition<
  JSONGeneratorInputs,
  JSONGeneratorOutputs,
  JSONGeneratorParams
> = {
  type: 'Interoperability::JSONGenerator',
  category: 'Interoperability',
  subcategory: 'API',

  metadata: {
    label: 'JSONGenerator',
    description: 'Generate JSON from data',
  },

  params: {
    indent: {
      default: 2,
      min: 0,
      max: 8,
      description: 'Indentation spaces',
    },
    compact: {
      default: false,
      description: 'Compact output',
    },
  },

  inputs: {
    data: 'Properties',
  },

  outputs: {
    json: 'string',
    size: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jsonGenerator',
      params: {
        data: inputs.data,
        indent: params.indent,
        compact: params.compact,
      },
    });

    return {
      json: result,
      size: result,
    };
  },
};
