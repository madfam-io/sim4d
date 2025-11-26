import type { NodeDefinition } from '@sim4d/types';

interface CutOrderOptimizationParams {
  innerFirst: boolean;
  minimizeTravel: boolean;
}

interface CutOrderOptimizationInputs {
  paths: unknown;
}

interface CutOrderOptimizationOutputs {
  orderedPaths: unknown;
  travelPath: unknown;
}

export const FabricationLaserCutOrderOptimizationNode: NodeDefinition<
  CutOrderOptimizationInputs,
  CutOrderOptimizationOutputs,
  CutOrderOptimizationParams
> = {
  id: 'Fabrication::CutOrderOptimization',
  type: 'Fabrication::CutOrderOptimization',
  category: 'Fabrication',
  label: 'CutOrderOptimization',
  description: 'Optimize cutting order',
  inputs: {
    paths: {
      type: 'Wire[]',
      label: 'Paths',
      required: true,
    },
  },
  outputs: {
    orderedPaths: {
      type: 'Wire[]',
      label: 'Ordered Paths',
    },
    travelPath: {
      type: 'Wire',
      label: 'Travel Path',
    },
  },
  params: {
    innerFirst: {
      type: 'boolean',
      label: 'Inner First',
      default: true,
    },
    minimizeTravel: {
      type: 'boolean',
      label: 'Minimize Travel',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'cutOrderOptimization',
      params: {
        paths: inputs.paths,
        innerFirst: params.innerFirst,
        minimizeTravel: params.minimizeTravel,
      },
    });

    return {
      orderedPaths: results.orderedPaths,
      travelPath: results.travelPath,
    };
  },
};
