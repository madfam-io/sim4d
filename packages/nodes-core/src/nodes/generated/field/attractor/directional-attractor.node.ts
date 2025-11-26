import type { NodeDefinition } from '@sim4d/types';

interface DirectionalAttractorParams {
  direction: [number, number, number];
  strength: number;
  spread: number;
}

interface DirectionalAttractorInputs {
  origin: [number, number, number];
}

interface DirectionalAttractorOutputs {
  field: unknown;
}

export const FieldAttractorDirectionalAttractorNode: NodeDefinition<
  DirectionalAttractorInputs,
  DirectionalAttractorOutputs,
  DirectionalAttractorParams
> = {
  id: 'Field::DirectionalAttractor',
  category: 'Field',
  label: 'DirectionalAttractor',
  description: 'Directional attractor',
  inputs: {
    origin: {
      type: 'Point',
      label: 'Origin',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
    },
  },
  params: {
    direction: {
      type: 'vec3',
      label: 'Direction',
      default: [1, 0, 0],
    },
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: -10,
      max: 10,
    },
    spread: {
      type: 'number',
      label: 'Spread',
      default: 45,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorDirectional',
      params: {
        origin: inputs.origin,
        direction: params.direction,
        strength: params.strength,
        spread: params.spread,
      },
    });

    return {
      field: result,
    };
  },
};
