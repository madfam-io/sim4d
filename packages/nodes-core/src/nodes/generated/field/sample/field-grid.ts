import type { NodeDefinition } from '@sim4d/types';

interface FieldGridParams {
  resolutionX: number;
  resolutionY: number;
  resolutionZ: number;
}

interface FieldGridInputs {
  field: unknown;
  bounds: unknown;
}

interface FieldGridOutputs {
  grid: unknown;
  points: Array<[number, number, number]>;
  values: unknown;
}

export const FieldSampleFieldGridNode: NodeDefinition<
  FieldGridInputs,
  FieldGridOutputs,
  FieldGridParams
> = {
  id: 'Field::FieldGrid',
  type: 'Field::FieldGrid',
  category: 'Field',
  label: 'FieldGrid',
  description: 'Sample field on grid',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    grid: {
      type: 'Data',
      label: 'Grid',
    },
    points: {
      type: 'Point[]',
      label: 'Points',
    },
    values: {
      type: 'number[]',
      label: 'Values',
    },
  },
  params: {
    resolutionX: {
      type: 'number',
      label: 'Resolution X',
      default: 10,
      min: 2,
      max: 100,
      step: 1,
    },
    resolutionY: {
      type: 'number',
      label: 'Resolution Y',
      default: 10,
      min: 2,
      max: 100,
      step: 1,
    },
    resolutionZ: {
      type: 'number',
      label: 'Resolution Z',
      default: 10,
      min: 2,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fieldGrid',
      params: {
        field: inputs.field,
        bounds: inputs.bounds,
        resolutionX: params.resolutionX,
        resolutionY: params.resolutionY,
        resolutionZ: params.resolutionZ,
      },
    });

    return {
      grid: results.grid,
      points: results.points,
      values: results.values,
    };
  },
};
