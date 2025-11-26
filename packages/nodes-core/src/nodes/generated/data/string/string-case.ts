import type { NodeDefinition } from '@sim4d/types';

interface StringCaseParams {
  case: string;
}

interface StringCaseInputs {
  string: unknown;
}

interface StringCaseOutputs {
  result: unknown;
}

export const DataStringStringCaseNode: NodeDefinition<
  StringCaseInputs,
  StringCaseOutputs,
  StringCaseParams
> = {
  id: 'Data::StringCase',
  type: 'Data::StringCase',
  category: 'Data',
  label: 'StringCase',
  description: 'Change string case',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
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
    case: {
      type: 'enum',
      label: 'Case',
      default: 'lower',
      options: ['upper', 'lower', 'title', 'camel', 'snake'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringCase',
      params: {
        string: inputs.string,
        case: params.case,
      },
    });

    return {
      result: result,
    };
  },
};
