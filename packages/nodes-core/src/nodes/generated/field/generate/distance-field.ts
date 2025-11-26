import type { NodeDefinition } from '@sim4d/types';

interface DistanceFieldParams {
  maxDistance: number;
  inside: boolean;
  signed: boolean;
}

interface DistanceFieldInputs {
  geometry: unknown;
}

interface DistanceFieldOutputs {
  field: unknown;
}

export const FieldGenerateDistanceFieldNode: NodeDefinition<
  DistanceFieldInputs,
  DistanceFieldOutputs,
  DistanceFieldParams
> = {
  id: 'Field::DistanceField',
  type: 'Field::DistanceField',
  category: 'Field',
  label: 'DistanceField',
  description: 'Distance field from geometry',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    maxDistance: {
      type: 'number',
      label: 'Max Distance',
      default: 100,
      min: 0.1,
    },
    inside: {
      type: 'boolean',
      label: 'Inside',
      default: false,
    },
    signed: {
      type: 'boolean',
      label: 'Signed',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldDistance',
      params: {
        geometry: inputs.geometry,
        maxDistance: params.maxDistance,
        inside: params.inside,
        signed: params.signed,
      },
    });

    return {
      field: result,
    };
  },
};
