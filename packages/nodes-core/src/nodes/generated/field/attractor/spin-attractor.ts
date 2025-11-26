import type { NodeDefinition } from '@sim4d/types';

interface SpinAttractorParams {
  strength: number;
  radius: number;
  axis: [number, number, number];
  decay: number;
}

interface SpinAttractorInputs {
  center: [number, number, number];
}

interface SpinAttractorOutputs {
  field: unknown;
}

export const FieldAttractorSpinAttractorNode: NodeDefinition<
  SpinAttractorInputs,
  SpinAttractorOutputs,
  SpinAttractorParams
> = {
  id: 'Field::SpinAttractor',
  type: 'Field::SpinAttractor',
  category: 'Field',
  label: 'SpinAttractor',
  description: 'Spinning attractor field',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
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
      default: 100,
      min: 0.1,
    },
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: [0, 0, 1],
    },
    decay: {
      type: 'number',
      label: 'Decay',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorSpin',
      params: {
        center: inputs.center,
        strength: params.strength,
        radius: params.radius,
        axis: params.axis,
        decay: params.decay,
      },
    });

    return {
      field: result,
    };
  },
};
