import type { NodeDefinition } from '@brepflow/types';

interface SphericalFieldParams {
  innerRadius: number;
  outerRadius: number;
  falloff: string;
}

interface SphericalFieldInputs {
  center: [number, number, number];
}

interface SphericalFieldOutputs {
  field: unknown;
}

export const FieldGenerateSphericalFieldNode: NodeDefinition<
  SphericalFieldInputs,
  SphericalFieldOutputs,
  SphericalFieldParams
> = {
  id: 'Field::SphericalField',
  type: 'Field::SphericalField',
  category: 'Field',
  label: 'SphericalField',
  description: 'Spherical field',
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
    innerRadius: {
      type: 'number',
      label: 'Inner Radius',
      default: 10,
      min: 0,
    },
    outerRadius: {
      type: 'number',
      label: 'Outer Radius',
      default: 100,
      min: 0.1,
    },
    falloff: {
      type: 'enum',
      label: 'Falloff',
      default: 'smooth',
      options: ['linear', 'smooth', 'exponential'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldSpherical',
      params: {
        center: inputs.center,
        innerRadius: params.innerRadius,
        outerRadius: params.outerRadius,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
