import type { NodeDefinition } from '@sim4d/types';

interface GasSpringParams {
  cylinderDiameter: number;
  strokeLength: number;
  extendedLength: number;
  rodDiameter: number;
}

interface GasSpringInputs {
  mountPoint: [number, number, number];
}

interface GasSpringOutputs {
  gasSpring: unknown;
  cylinder: unknown;
  rod: unknown;
}

export const MechanicalEngineeringSpringsGasSpringNode: NodeDefinition<
  GasSpringInputs,
  GasSpringOutputs,
  GasSpringParams
> = {
  id: 'MechanicalEngineering::GasSpring',
  category: 'MechanicalEngineering',
  label: 'GasSpring',
  description: 'Create gas spring/damper',
  inputs: {
    mountPoint: {
      type: 'Point',
      label: 'Mount Point',
      required: true,
    },
  },
  outputs: {
    gasSpring: {
      type: 'Shape',
      label: 'Gas Spring',
    },
    cylinder: {
      type: 'Shape',
      label: 'Cylinder',
    },
    rod: {
      type: 'Shape',
      label: 'Rod',
    },
  },
  params: {
    cylinderDiameter: {
      type: 'number',
      label: 'Cylinder Diameter',
      default: 20,
      min: 10,
      max: 50,
    },
    strokeLength: {
      type: 'number',
      label: 'Stroke Length',
      default: 100,
      min: 30,
      max: 300,
    },
    extendedLength: {
      type: 'number',
      label: 'Extended Length',
      default: 250,
      min: 100,
      max: 600,
    },
    rodDiameter: {
      type: 'number',
      label: 'Rod Diameter',
      default: 8,
      min: 4,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'gasSpring',
      params: {
        mountPoint: inputs.mountPoint,
        cylinderDiameter: params.cylinderDiameter,
        strokeLength: params.strokeLength,
        extendedLength: params.extendedLength,
        rodDiameter: params.rodDiameter,
      },
    });

    return {
      gasSpring: results.gasSpring,
      cylinder: results.cylinder,
      rod: results.rod,
    };
  },
};
