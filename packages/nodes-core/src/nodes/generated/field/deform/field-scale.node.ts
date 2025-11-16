import type { NodeDefinition } from '@brepflow/types';

interface FieldScaleParams {
  minScale: number;
  maxScale: number;
}

interface FieldScaleInputs {
  geometry: unknown;
  field: unknown;
}

interface FieldScaleOutputs {
  scaled: unknown;
}

export const FieldDeformFieldScaleNode: NodeDefinition<
  FieldScaleInputs,
  FieldScaleOutputs,
  FieldScaleParams
> = {
  id: 'Field::FieldScale',
  category: 'Field',
  label: 'FieldScale',
  description: 'Scale by field',
  inputs: {
    geometry: {
      type: 'Shape[]',
      label: 'Geometry',
      required: true,
    },
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    scaled: {
      type: 'Shape[]',
      label: 'Scaled',
    },
  },
  params: {
    minScale: {
      type: 'number',
      label: 'Min Scale',
      default: 0.5,
      min: 0,
    },
    maxScale: {
      type: 'number',
      label: 'Max Scale',
      default: 2,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldScale',
      params: {
        geometry: inputs.geometry,
        field: inputs.field,
        minScale: params.minScale,
        maxScale: params.maxScale,
      },
    });

    return {
      scaled: result,
    };
  },
};
