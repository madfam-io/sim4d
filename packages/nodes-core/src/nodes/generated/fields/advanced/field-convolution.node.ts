import type { NodeDefinition } from '@brepflow/types';

interface FieldConvolutionParams {
  kernelSize: number;
}

interface FieldConvolutionInputs {
  field?: unknown;
  kernel: unknown;
}

interface FieldConvolutionOutputs {
  convolvedField: unknown;
}

export const FieldsAdvancedFieldConvolutionNode: NodeDefinition<
  FieldConvolutionInputs,
  FieldConvolutionOutputs,
  FieldConvolutionParams
> = {
  id: 'Fields::FieldConvolution',
  category: 'Fields',
  label: 'FieldConvolution',
  description: 'Convolve field with kernel',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    kernel: {
      type: 'Field',
      label: 'Kernel',
      required: true,
    },
  },
  outputs: {
    convolvedField: {
      type: 'Field',
      label: 'Convolved Field',
    },
  },
  params: {
    kernelSize: {
      type: 'number',
      label: 'Kernel Size',
      default: 3,
      min: 3,
      max: 11,
      step: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convolveField',
      params: {
        field: inputs.field,
        kernel: inputs.kernel,
        kernelSize: params.kernelSize,
      },
    });

    return {
      convolvedField: result,
    };
  },
};
