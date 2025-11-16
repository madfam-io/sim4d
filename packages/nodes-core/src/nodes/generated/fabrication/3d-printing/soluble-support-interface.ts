import type { NodeDefinition } from '@brepflow/types';

interface SolubleSupportInterfaceParams {
  interfaceLayers: number;
  interfaceDensity: number;
}

interface SolubleSupportInterfaceInputs {
  supports: unknown;
}

interface SolubleSupportInterfaceOutputs {
  interface: unknown;
}

export const Fabrication3DPrintingSolubleSupportInterfaceNode: NodeDefinition<
  SolubleSupportInterfaceInputs,
  SolubleSupportInterfaceOutputs,
  SolubleSupportInterfaceParams
> = {
  id: 'Fabrication::SolubleSupportInterface',
  type: 'Fabrication::SolubleSupportInterface',
  category: 'Fabrication',
  label: 'SolubleSupportInterface',
  description: 'Soluble support interface',
  inputs: {
    supports: {
      type: 'Shape',
      label: 'Supports',
      required: true,
    },
  },
  outputs: {
    interface: {
      type: 'Shape',
      label: 'Interface',
    },
  },
  params: {
    interfaceLayers: {
      type: 'number',
      label: 'Interface Layers',
      default: 2,
      min: 1,
      max: 5,
      step: 1,
    },
    interfaceDensity: {
      type: 'number',
      label: 'Interface Density',
      default: 0.9,
      min: 0.5,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'solubleSupportInterface',
      params: {
        supports: inputs.supports,
        interfaceLayers: params.interfaceLayers,
        interfaceDensity: params.interfaceDensity,
      },
    });

    return {
      interface: result,
    };
  },
};
