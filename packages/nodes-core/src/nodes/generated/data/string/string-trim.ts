import type { NodeDefinition } from '@sim4d/types';

interface StringTrimParams {
  mode: string;
}

interface StringTrimInputs {
  string: unknown;
}

interface StringTrimOutputs {
  trimmed: unknown;
}

export const DataStringStringTrimNode: NodeDefinition<
  StringTrimInputs,
  StringTrimOutputs,
  StringTrimParams
> = {
  id: 'Data::StringTrim',
  type: 'Data::StringTrim',
  category: 'Data',
  label: 'StringTrim',
  description: 'Trim whitespace',
  inputs: {
    string: {
      type: 'string',
      label: 'String',
      required: true,
    },
  },
  outputs: {
    trimmed: {
      type: 'string',
      label: 'Trimmed',
    },
  },
  params: {
    mode: {
      type: 'enum',
      label: 'Mode',
      default: 'both',
      options: ['both', 'start', 'end'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stringTrim',
      params: {
        string: inputs.string,
        mode: params.mode,
      },
    });

    return {
      trimmed: result,
    };
  },
};
