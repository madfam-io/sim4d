import type { NodeDefinition } from '@brepflow/types';

interface VortexAttractorParams {
  strength: number;
  radius: number;
  coreRadius: number;
  height: number;
}

interface VortexAttractorInputs {
  axis: unknown;
}

interface VortexAttractorOutputs {
  field: unknown;
}

export const FieldAttractorVortexAttractorNode: NodeDefinition<
  VortexAttractorInputs,
  VortexAttractorOutputs,
  VortexAttractorParams
> = {
  id: 'Field::VortexAttractor',
  category: 'Field',
  label: 'VortexAttractor',
  description: 'Vortex attractor field',
  inputs: {
    axis: {
      type: 'Line',
      label: 'Axis',
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
    coreRadius: {
      type: 'number',
      label: 'Core Radius',
      default: 10,
      min: 0.1,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 200,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorVortex',
      params: {
        axis: inputs.axis,
        strength: params.strength,
        radius: params.radius,
        coreRadius: params.coreRadius,
        height: params.height,
      },
    });

    return {
      field: result,
    };
  },
};
