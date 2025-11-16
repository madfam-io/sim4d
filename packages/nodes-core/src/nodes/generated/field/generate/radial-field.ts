import type { NodeDefinition } from '@brepflow/types';

interface RadialFieldParams {
  falloff: string;
  radius: number;
  strength: number;
}

interface RadialFieldInputs {
  center: [number, number, number];
}

interface RadialFieldOutputs {
  field: unknown;
}

export const FieldGenerateRadialFieldNode: NodeDefinition<
  RadialFieldInputs,
  RadialFieldOutputs,
  RadialFieldParams
> = {
  id: 'Field::RadialField',
  type: 'Field::RadialField',
  category: 'Field',
  label: 'RadialField',
  description: 'Radial gradient field',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
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
    falloff: {
      type: 'enum',
      label: 'Falloff',
      default: 'linear',
      options: ['linear', 'quadratic', 'exponential', 'gaussian'],
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 100,
      min: 0.1,
    },
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldRadial',
      params: {
        center: inputs.center,
        falloff: params.falloff,
        radius: params.radius,
        strength: params.strength,
      },
    });

    return {
      field: result,
    };
  },
};
