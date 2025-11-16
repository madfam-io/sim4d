import type { NodeDefinition } from '@brepflow/types';

interface CleanupPathsParams {
  tolerance: number;
  removeDoubles: boolean;
}

interface CleanupPathsInputs {
  paths: unknown;
}

interface CleanupPathsOutputs {
  cleanPaths: unknown;
}

export const FabricationLaserCleanupPathsNode: NodeDefinition<
  CleanupPathsInputs,
  CleanupPathsOutputs,
  CleanupPathsParams
> = {
  id: 'Fabrication::CleanupPaths',
  type: 'Fabrication::CleanupPaths',
  category: 'Fabrication',
  label: 'CleanupPaths',
  description: 'Clean and optimize paths',
  inputs: {
    paths: {
      type: 'Wire[]',
      label: 'Paths',
      required: true,
    },
  },
  outputs: {
    cleanPaths: {
      type: 'Wire[]',
      label: 'Clean Paths',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 0.1,
    },
    removeDoubles: {
      type: 'boolean',
      label: 'Remove Doubles',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'cleanupPaths',
      params: {
        paths: inputs.paths,
        tolerance: params.tolerance,
        removeDoubles: params.removeDoubles,
      },
    });

    return {
      cleanPaths: result,
    };
  },
};
