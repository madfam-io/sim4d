import type { NodeDefinition } from '@sim4d/types';

interface MultiplePassesParams {
  passes: number;
  powerRamp: boolean;
  zStep: number;
}

interface MultiplePassesInputs {
  paths: unknown;
}

interface MultiplePassesOutputs {
  multipassPaths: unknown;
}

export const FabricationLaserMultiplePassesNode: NodeDefinition<
  MultiplePassesInputs,
  MultiplePassesOutputs,
  MultiplePassesParams
> = {
  id: 'Fabrication::MultiplePasses',
  type: 'Fabrication::MultiplePasses',
  category: 'Fabrication',
  label: 'MultiplePasses',
  description: 'Setup multiple passes',
  inputs: {
    paths: {
      type: 'Wire[]',
      label: 'Paths',
      required: true,
    },
  },
  outputs: {
    multipassPaths: {
      type: 'Wire[][]',
      label: 'Multipass Paths',
    },
  },
  params: {
    passes: {
      type: 'number',
      label: 'Passes',
      default: 2,
      min: 1,
      max: 10,
      step: 1,
    },
    powerRamp: {
      type: 'boolean',
      label: 'Power Ramp',
      default: false,
    },
    zStep: {
      type: 'number',
      label: 'Z Step',
      default: 0,
      min: 0,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'multiplePasses',
      params: {
        paths: inputs.paths,
        passes: params.passes,
        powerRamp: params.powerRamp,
        zStep: params.zStep,
      },
    });

    return {
      multipassPaths: result,
    };
  },
};
