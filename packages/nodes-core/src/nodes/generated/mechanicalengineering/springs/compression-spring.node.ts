import type { NodeDefinition } from '@brepflow/types';

interface CompressionSpringParams {
  wireDiameter: number;
  coilDiameter: number;
  freeLength: number;
  coils: number;
  endType: string;
}

interface CompressionSpringInputs {
  center: [number, number, number];
  axis?: [number, number, number];
}

interface CompressionSpringOutputs {
  spring: unknown;
  helix: unknown;
}

export const MechanicalEngineeringSpringsCompressionSpringNode: NodeDefinition<
  CompressionSpringInputs,
  CompressionSpringOutputs,
  CompressionSpringParams
> = {
  id: 'MechanicalEngineering::CompressionSpring',
  category: 'MechanicalEngineering',
  label: 'CompressionSpring',
  description: 'Create compression coil spring',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
    axis: {
      type: 'Vector',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    spring: {
      type: 'Shape',
      label: 'Spring',
    },
    helix: {
      type: 'Wire',
      label: 'Helix',
    },
  },
  params: {
    wireDiameter: {
      type: 'number',
      label: 'Wire Diameter',
      default: 2,
      min: 0.5,
      max: 10,
    },
    coilDiameter: {
      type: 'number',
      label: 'Coil Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
    freeLength: {
      type: 'number',
      label: 'Free Length',
      default: 50,
      min: 10,
      max: 200,
    },
    coils: {
      type: 'number',
      label: 'Coils',
      default: 8,
      min: 3,
      max: 30,
    },
    endType: {
      type: 'enum',
      label: 'End Type',
      default: 'closed',
      options: ['closed', 'open', 'ground'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'compressionSpring',
      params: {
        center: inputs.center,
        axis: inputs.axis,
        wireDiameter: params.wireDiameter,
        coilDiameter: params.coilDiameter,
        freeLength: params.freeLength,
        coils: params.coils,
        endType: params.endType,
      },
    });

    return {
      spring: results.spring,
      helix: results.helix,
    };
  },
};
