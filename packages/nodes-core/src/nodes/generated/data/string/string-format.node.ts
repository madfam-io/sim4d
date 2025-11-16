import type { NodeDefinition } from '@brepflow/types';

type StringFormatParams = Record<string, never>;

interface StringFormatInputs {
  template: unknown;
  values: unknown;
}

interface StringFormatOutputs {
  formatted: unknown;
}

export const DataStringStringFormatNode: NodeDefinition<
  StringFormatInputs,
  StringFormatOutputs,
  StringFormatParams
> = {
  id: 'Data::StringFormat',
  category: 'Data',
  label: 'StringFormat',
  description: 'Format string',
  inputs: {
    template: {
      type: 'string',
      label: 'Template',
      required: true,
    },
    values: {
      type: 'Data[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    formatted: {
      type: 'string',
      label: 'Formatted',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringFormat',
      params: {
        template: inputs.template,
        values: inputs.values,
      },
    });

    return {
      formatted: result,
    };
  },
};
