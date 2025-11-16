import type { NodeDefinition } from '@brepflow/types';

interface StringConcatParams {
  separator: string;
}

interface StringConcatInputs {
  strings: unknown;
}

interface StringConcatOutputs {
  result: unknown;
}

export const DataStringStringConcatNode: NodeDefinition<
  StringConcatInputs,
  StringConcatOutputs,
  StringConcatParams
> = {
  id: 'Data::StringConcat',
  type: 'Data::StringConcat',
  category: 'Data',
  label: 'StringConcat',
  description: 'Concatenate strings',
  inputs: {
    strings: {
      type: 'string[]',
      label: 'Strings',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'string',
      label: 'Result',
    },
  },
  params: {
    separator: {
      type: 'string',
      label: 'Separator',
      default: '',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringConcat',
      params: {
        strings: inputs.strings,
        separator: params.separator,
      },
    });

    return {
      result: result,
    };
  },
};
