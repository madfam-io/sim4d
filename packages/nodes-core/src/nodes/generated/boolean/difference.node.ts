import type { NodeDefinition } from '@sim4d/types';

interface DifferenceParams {
  keepOriginals: boolean;
  fuzzyValue: number;
}

interface DifferenceInputs {
  base: unknown;
  tools: unknown;
}

interface DifferenceOutputs {
  result: unknown;
}

export const BooleanDifferenceNode: NodeDefinition<
  DifferenceInputs,
  DifferenceOutputs,
  DifferenceParams
> = {
  id: 'Boolean::Difference',
  category: 'Boolean',
  label: 'Difference',
  description: 'Subtract tool shapes from base shape',
  inputs: {
    base: {
      type: 'Shape',
      label: 'Base',
      required: true,
    },
    tools: {
      type: 'Shape[]',
      label: 'Tools',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    keepOriginals: {
      type: 'boolean',
      label: 'Keep Originals',
      default: false,
    },
    fuzzyValue: {
      type: 'number',
      label: 'Fuzzy Value',
      default: 1e-7,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanDifference',
      params: {
        base: inputs.base,
        tools: inputs.tools,
        keepOriginals: params.keepOriginals,
        fuzzyValue: params.fuzzyValue,
      },
    });

    return {
      result: result,
    };
  },
};
