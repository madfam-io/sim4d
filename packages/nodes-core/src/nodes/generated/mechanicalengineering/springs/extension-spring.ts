import type { NodeDefinition } from '@sim4d/types';

interface ExtensionSpringParams {
  wireDiameter: number;
  coilDiameter: number;
  bodyLength: number;
  coils: number;
  hookType: string;
}

interface ExtensionSpringInputs {
  center: [number, number, number];
}

interface ExtensionSpringOutputs {
  spring: unknown;
  hooks: unknown;
}

export const MechanicalEngineeringSpringsExtensionSpringNode: NodeDefinition<
  ExtensionSpringInputs,
  ExtensionSpringOutputs,
  ExtensionSpringParams
> = {
  id: 'MechanicalEngineering::ExtensionSpring',
  type: 'MechanicalEngineering::ExtensionSpring',
  category: 'MechanicalEngineering',
  label: 'ExtensionSpring',
  description: 'Create extension spring with hooks',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    spring: {
      type: 'Shape',
      label: 'Spring',
    },
    hooks: {
      type: 'Wire[]',
      label: 'Hooks',
    },
  },
  params: {
    wireDiameter: {
      type: 'number',
      label: 'Wire Diameter',
      default: 1.5,
      min: 0.5,
      max: 8,
    },
    coilDiameter: {
      type: 'number',
      label: 'Coil Diameter',
      default: 15,
      min: 5,
      max: 80,
    },
    bodyLength: {
      type: 'number',
      label: 'Body Length',
      default: 40,
      min: 10,
      max: 150,
    },
    coils: {
      type: 'number',
      label: 'Coils',
      default: 10,
      min: 5,
      max: 40,
    },
    hookType: {
      type: 'enum',
      label: 'Hook Type',
      default: 'machine',
      options: ['machine', 'side', 'center'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'extensionSpring',
      params: {
        center: inputs.center,
        wireDiameter: params.wireDiameter,
        coilDiameter: params.coilDiameter,
        bodyLength: params.bodyLength,
        coils: params.coils,
        hookType: params.hookType,
      },
    });

    return {
      spring: results.spring,
      hooks: results.hooks,
    };
  },
};
