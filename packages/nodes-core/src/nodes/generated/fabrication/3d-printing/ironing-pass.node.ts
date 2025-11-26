import type { NodeDefinition } from '@sim4d/types';

interface IroningPassParams {
  ironingSpeed: number;
  flowRate: number;
}

interface IroningPassInputs {
  topSurfaces: unknown;
}

interface IroningPassOutputs {
  ironingPaths: unknown;
}

export const Fabrication3DPrintingIroningPassNode: NodeDefinition<
  IroningPassInputs,
  IroningPassOutputs,
  IroningPassParams
> = {
  id: 'Fabrication::IroningPass',
  category: 'Fabrication',
  label: 'IroningPass',
  description: 'Generate ironing passes',
  inputs: {
    topSurfaces: {
      type: 'Face[]',
      label: 'Top Surfaces',
      required: true,
    },
  },
  outputs: {
    ironingPaths: {
      type: 'Wire[]',
      label: 'Ironing Paths',
    },
  },
  params: {
    ironingSpeed: {
      type: 'number',
      label: 'Ironing Speed',
      default: 20,
      min: 5,
      max: 50,
    },
    flowRate: {
      type: 'number',
      label: 'Flow Rate',
      default: 0.1,
      min: 0,
      max: 0.3,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'ironingPass',
      params: {
        topSurfaces: inputs.topSurfaces,
        ironingSpeed: params.ironingSpeed,
        flowRate: params.flowRate,
      },
    });

    return {
      ironingPaths: result,
    };
  },
};
