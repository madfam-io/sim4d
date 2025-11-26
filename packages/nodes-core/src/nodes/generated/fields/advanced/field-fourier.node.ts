import type { NodeDefinition } from '@sim4d/types';

interface FieldFourierParams {
  direction: string;
}

interface FieldFourierInputs {
  field?: unknown;
}

interface FieldFourierOutputs {
  transformedField: unknown;
  phase: unknown;
  magnitude: unknown;
}

export const FieldsAdvancedFieldFourierNode: NodeDefinition<
  FieldFourierInputs,
  FieldFourierOutputs,
  FieldFourierParams
> = {
  id: 'Fields::FieldFourier',
  category: 'Fields',
  label: 'FieldFourier',
  description: 'Fourier transform of field',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
  },
  outputs: {
    transformedField: {
      type: 'Field',
      label: 'Transformed Field',
    },
    phase: {
      type: 'Field',
      label: 'Phase',
    },
    magnitude: {
      type: 'Field',
      label: 'Magnitude',
    },
  },
  params: {
    direction: {
      type: 'enum',
      label: 'Direction',
      default: '"forward"',
      options: ['forward', 'inverse'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fourierTransform',
      params: {
        field: inputs.field,
        direction: params.direction,
      },
    });

    return {
      transformedField: results.transformedField,
      phase: results.phase,
      magnitude: results.magnitude,
    };
  },
};
