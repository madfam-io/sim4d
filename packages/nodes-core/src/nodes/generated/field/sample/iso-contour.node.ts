import type { NodeDefinition } from '@brepflow/types';

interface IsoContourParams {
  value: number;
  smooth: boolean;
}

interface IsoContourInputs {
  field: unknown;
}

interface IsoContourOutputs {
  contours: unknown;
}

export const FieldSampleIsoContourNode: NodeDefinition<
  IsoContourInputs,
  IsoContourOutputs,
  IsoContourParams
> = {
  id: 'Field::IsoContour',
  category: 'Field',
  label: 'IsoContour',
  description: 'Extract iso-contours',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    contours: {
      type: 'Wire[]',
      label: 'Contours',
    },
  },
  params: {
    value: {
      type: 'number',
      label: 'Value',
      default: 0.5,
    },
    smooth: {
      type: 'boolean',
      label: 'Smooth',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldIsoContour',
      params: {
        field: inputs.field,
        value: params.value,
        smooth: params.smooth,
      },
    });

    return {
      contours: result,
    };
  },
};
