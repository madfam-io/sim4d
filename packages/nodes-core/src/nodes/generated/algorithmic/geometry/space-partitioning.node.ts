import type { NodeDefinition } from '@brepflow/types';

interface SpacePartitioningParams {
  type: string;
  maxDepth: number;
  leafSize: number;
}

interface SpacePartitioningInputs {
  objects: unknown;
}

interface SpacePartitioningOutputs {
  structure: unknown;
  stats: unknown;
  visualization: unknown;
}

export const AlgorithmicGeometrySpacePartitioningNode: NodeDefinition<
  SpacePartitioningInputs,
  SpacePartitioningOutputs,
  SpacePartitioningParams
> = {
  id: 'Algorithmic::SpacePartitioning',
  category: 'Algorithmic',
  label: 'SpacePartitioning',
  description: 'Spatial data structure for fast queries',
  inputs: {
    objects: {
      type: 'Shape[]',
      label: 'Objects',
      required: true,
    },
  },
  outputs: {
    structure: {
      type: 'Properties',
      label: 'Structure',
    },
    stats: {
      type: 'Properties',
      label: 'Stats',
    },
    visualization: {
      type: 'Wire[]',
      label: 'Visualization',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'octree',
      options: ['octree', 'kdtree', 'bvh'],
    },
    maxDepth: {
      type: 'number',
      label: 'Max Depth',
      default: 8,
      min: 3,
      max: 15,
    },
    leafSize: {
      type: 'number',
      label: 'Leaf Size',
      default: 10,
      min: 1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'spacePartitioning',
      params: {
        objects: inputs.objects,
        type: params.type,
        maxDepth: params.maxDepth,
        leafSize: params.leafSize,
      },
    });

    return {
      structure: results.structure,
      stats: results.stats,
      visualization: results.visualization,
    };
  },
};
