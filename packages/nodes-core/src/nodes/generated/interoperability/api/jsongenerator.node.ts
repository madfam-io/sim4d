import type { NodeDefinition } from '@sim4d/types';

interface JSONGeneratorParams {
  indent: number;
  compact: boolean;
}

interface JSONGeneratorInputs {
  data: unknown;
}

interface JSONGeneratorOutputs {
  json: unknown;
  size: unknown;
}

export const InteroperabilityAPIJSONGeneratorNode: NodeDefinition<
  JSONGeneratorInputs,
  JSONGeneratorOutputs,
  JSONGeneratorParams
> = {
  id: 'Interoperability::JSONGenerator',
  category: 'Interoperability',
  label: 'JSONGenerator',
  description: 'Generate JSON from data',
  inputs: {
    data: {
      type: 'Properties',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    json: {
      type: 'string',
      label: 'Json',
    },
    size: {
      type: 'number',
      label: 'Size',
    },
  },
  params: {
    indent: {
      type: 'number',
      label: 'Indent',
      default: 2,
      min: 0,
      max: 8,
    },
    compact: {
      type: 'boolean',
      label: 'Compact',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'jsonGenerator',
      params: {
        data: inputs.data,
        indent: params.indent,
        compact: params.compact,
      },
    });

    return {
      json: results.json,
      size: results.size,
    };
  },
};
