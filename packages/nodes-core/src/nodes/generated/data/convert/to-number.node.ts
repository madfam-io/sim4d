import type { NodeDefinition } from '@brepflow/types';

type ToNumberParams = Record<string, never>;

interface ToNumberInputs {
  data: unknown;
}

interface ToNumberOutputs {
  number: unknown;
  isValid: unknown;
}

export const DataConvertToNumberNode: NodeDefinition<
  ToNumberInputs,
  ToNumberOutputs,
  ToNumberParams
> = {
  id: 'Data::ToNumber',
  category: 'Data',
  label: 'ToNumber',
  description: 'Convert to number',
  inputs: {
    data: {
      type: 'Data',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    number: {
      type: 'number',
      label: 'Number',
    },
    isValid: {
      type: 'boolean',
      label: 'Is Valid',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'convertToNumber',
      params: {
        data: inputs.data,
      },
    });

    return {
      number: results.number,
      isValid: results.isValid,
    };
  },
};
