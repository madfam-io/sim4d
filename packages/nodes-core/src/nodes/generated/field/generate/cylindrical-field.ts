import type { NodeDefinition } from '@sim4d/types';

interface CylindricalFieldParams {
  radius: number;
  height: number;
  falloff: string;
}

interface CylindricalFieldInputs {
  axis: unknown;
}

interface CylindricalFieldOutputs {
  field: unknown;
}

export const FieldGenerateCylindricalFieldNode: NodeDefinition<
  CylindricalFieldInputs,
  CylindricalFieldOutputs,
  CylindricalFieldParams
> = {
  id: 'Field::CylindricalField',
  type: 'Field::CylindricalField',
  category: 'Field',
  label: 'CylindricalField',
  description: 'Cylindrical field',
  inputs: {
    axis: {
      type: 'Line',
      label: 'Axis',
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
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
    },
    height: {
      type: 'number',
      label: 'Height',
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
      type: 'fieldCylindrical',
      params: {
        axis: inputs.axis,
        radius: params.radius,
        height: params.height,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
