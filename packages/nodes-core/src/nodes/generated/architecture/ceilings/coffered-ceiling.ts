import type { NodeDefinition } from '@sim4d/types';

interface CofferedCeilingParams {
  cofferSize: number;
  cofferDepth: number;
  beamWidth: number;
}

interface CofferedCeilingInputs {
  ceilingBoundary: unknown;
}

interface CofferedCeilingOutputs {
  cofferedCeiling: unknown;
}

export const ArchitectureCeilingsCofferedCeilingNode: NodeDefinition<
  CofferedCeilingInputs,
  CofferedCeilingOutputs,
  CofferedCeilingParams
> = {
  id: 'Architecture::CofferedCeiling',
  type: 'Architecture::CofferedCeiling',
  category: 'Architecture',
  label: 'CofferedCeiling',
  description: 'Coffered ceiling pattern',
  inputs: {
    ceilingBoundary: {
      type: 'Wire',
      label: 'Ceiling Boundary',
      required: true,
    },
  },
  outputs: {
    cofferedCeiling: {
      type: 'Shape',
      label: 'Coffered Ceiling',
    },
  },
  params: {
    cofferSize: {
      type: 'number',
      label: 'Coffer Size',
      default: 1200,
      min: 600,
      max: 2000,
    },
    cofferDepth: {
      type: 'number',
      label: 'Coffer Depth',
      default: 150,
      min: 50,
      max: 300,
    },
    beamWidth: {
      type: 'number',
      label: 'Beam Width',
      default: 200,
      min: 100,
      max: 400,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'cofferedCeiling',
      params: {
        ceilingBoundary: inputs.ceilingBoundary,
        cofferSize: params.cofferSize,
        cofferDepth: params.cofferDepth,
        beamWidth: params.beamWidth,
      },
    });

    return {
      cofferedCeiling: result,
    };
  },
};
