import type { NodeDefinition } from '@sim4d/types';

interface HelicalRampParams {
  radius: number;
  pitch: number;
  width: number;
}

interface HelicalRampInputs {
  centerPoint: [number, number, number];
  levels: number;
}

interface HelicalRampOutputs {
  helicalRamp: unknown;
}

export const ArchitectureRampsHelicalRampNode: NodeDefinition<
  HelicalRampInputs,
  HelicalRampOutputs,
  HelicalRampParams
> = {
  id: 'Architecture::HelicalRamp',
  type: 'Architecture::HelicalRamp',
  category: 'Architecture',
  label: 'HelicalRamp',
  description: 'Helical parking ramp',
  inputs: {
    centerPoint: {
      type: 'Point',
      label: 'Center Point',
      required: true,
    },
    levels: {
      type: 'Number',
      label: 'Levels',
      required: true,
    },
  },
  outputs: {
    helicalRamp: {
      type: 'Shape',
      label: 'Helical Ramp',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 15000,
      min: 10000,
      max: 25000,
    },
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 3000,
      min: 2500,
      max: 4000,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 7000,
      min: 5500,
      max: 9000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'helicalRamp',
      params: {
        centerPoint: inputs.centerPoint,
        levels: inputs.levels,
        radius: params.radius,
        pitch: params.pitch,
        width: params.width,
      },
    });

    return {
      helicalRamp: result,
    };
  },
};
