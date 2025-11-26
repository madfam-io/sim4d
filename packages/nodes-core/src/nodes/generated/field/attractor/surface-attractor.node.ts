import type { NodeDefinition } from '@sim4d/types';

interface SurfaceAttractorParams {
  strength: number;
  radius: number;
  falloff: string;
}

interface SurfaceAttractorInputs {
  surfaces: unknown;
}

interface SurfaceAttractorOutputs {
  field: unknown;
}

export const FieldAttractorSurfaceAttractorNode: NodeDefinition<
  SurfaceAttractorInputs,
  SurfaceAttractorOutputs,
  SurfaceAttractorParams
> = {
  id: 'Field::SurfaceAttractor',
  category: 'Field',
  label: 'SurfaceAttractor',
  description: 'Surface attractor field',
  inputs: {
    surfaces: {
      type: 'Face[]',
      label: 'Surfaces',
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
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: -10,
      max: 10,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 30,
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
      type: 'attractorSurface',
      params: {
        surfaces: inputs.surfaces,
        strength: params.strength,
        radius: params.radius,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
