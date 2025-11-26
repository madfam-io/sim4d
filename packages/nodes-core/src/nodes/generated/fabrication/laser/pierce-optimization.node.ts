import type { NodeDefinition } from '@sim4d/types';

interface PierceOptimizationParams {
  preferCorners: boolean;
  minEdgeDistance: number;
}

interface PierceOptimizationInputs {
  closedPaths: unknown;
}

interface PierceOptimizationOutputs {
  piercePoints: Array<[number, number, number]>;
}

export const FabricationLaserPierceOptimizationNode: NodeDefinition<
  PierceOptimizationInputs,
  PierceOptimizationOutputs,
  PierceOptimizationParams
> = {
  id: 'Fabrication::PierceOptimization',
  category: 'Fabrication',
  label: 'PierceOptimization',
  description: 'Optimize pierce points',
  inputs: {
    closedPaths: {
      type: 'Wire[]',
      label: 'Closed Paths',
      required: true,
    },
  },
  outputs: {
    piercePoints: {
      type: 'Point[]',
      label: 'Pierce Points',
    },
  },
  params: {
    preferCorners: {
      type: 'boolean',
      label: 'Prefer Corners',
      default: true,
    },
    minEdgeDistance: {
      type: 'number',
      label: 'Min Edge Distance',
      default: 2,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'pierceOptimization',
      params: {
        closedPaths: inputs.closedPaths,
        preferCorners: params.preferCorners,
        minEdgeDistance: params.minEdgeDistance,
      },
    });

    return {
      piercePoints: result,
    };
  },
};
