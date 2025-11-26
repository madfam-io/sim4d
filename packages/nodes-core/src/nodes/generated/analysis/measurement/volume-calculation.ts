import type { NodeDefinition } from '@sim4d/types';

interface VolumeCalculationParams {
  precision: number;
  density: number;
}

interface VolumeCalculationInputs {
  solid: unknown;
}

interface VolumeCalculationOutputs {
  volume: unknown;
  mass: unknown;
  centerOfMass: [number, number, number];
  inertiaMatrix: unknown;
}

export const AnalysisMeasurementVolumeCalculationNode: NodeDefinition<
  VolumeCalculationInputs,
  VolumeCalculationOutputs,
  VolumeCalculationParams
> = {
  id: 'Analysis::VolumeCalculation',
  type: 'Analysis::VolumeCalculation',
  category: 'Analysis',
  label: 'VolumeCalculation',
  description: 'Calculate volume and mass properties',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
  },
  outputs: {
    volume: {
      type: 'number',
      label: 'Volume',
    },
    mass: {
      type: 'number',
      label: 'Mass',
    },
    centerOfMass: {
      type: 'Point',
      label: 'Center Of Mass',
    },
    inertiaMatrix: {
      type: 'number[]',
      label: 'Inertia Matrix',
    },
  },
  params: {
    precision: {
      type: 'number',
      label: 'Precision',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 1,
      min: 0.001,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'volumeCalculation',
      params: {
        solid: inputs.solid,
        precision: params.precision,
        density: params.density,
      },
    });

    return {
      volume: results.volume,
      mass: results.mass,
      centerOfMass: results.centerOfMass,
      inertiaMatrix: results.inertiaMatrix,
    };
  },
};
