import type { NodeDefinition } from '@brepflow/types';

interface CurveAttractorParams {
  strength: number;
  radius: number;
  falloff: string;
}

interface CurveAttractorInputs {
  curves: unknown;
}

interface CurveAttractorOutputs {
  field: unknown;
}

export const FieldAttractorCurveAttractorNode: NodeDefinition<
  CurveAttractorInputs,
  CurveAttractorOutputs,
  CurveAttractorParams
> = {
  id: 'Field::CurveAttractor',
  category: 'Field',
  label: 'CurveAttractor',
  description: 'Curve attractor field',
  inputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
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
      default: 50,
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
      type: 'attractorCurve',
      params: {
        curves: inputs.curves,
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
