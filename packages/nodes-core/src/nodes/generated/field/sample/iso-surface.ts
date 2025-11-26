import type { NodeDefinition } from '@sim4d/types';

interface IsoSurfaceParams {
  value: number;
  resolution: number;
}

interface IsoSurfaceInputs {
  field: unknown;
}

interface IsoSurfaceOutputs {
  surface: unknown;
}

export const FieldSampleIsoSurfaceNode: NodeDefinition<
  IsoSurfaceInputs,
  IsoSurfaceOutputs,
  IsoSurfaceParams
> = {
  id: 'Field::IsoSurface',
  type: 'Field::IsoSurface',
  category: 'Field',
  label: 'IsoSurface',
  description: 'Extract iso-surface',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Mesh',
      label: 'Surface',
    },
  },
  params: {
    value: {
      type: 'number',
      label: 'Value',
      default: 0.5,
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 50,
      min: 10,
      max: 200,
      step: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldIsoSurface',
      params: {
        field: inputs.field,
        value: params.value,
        resolution: params.resolution,
      },
    });

    return {
      surface: result,
    };
  },
};
