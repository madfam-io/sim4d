import type { NodeDefinition } from '@brepflow/types';

interface PointCloudProcessingParams {
  operation: string;
  radius: number;
  neighbors: number;
}

interface PointCloudProcessingInputs {
  points: Array<[number, number, number]>;
}

interface PointCloudProcessingOutputs {
  processed: Array<[number, number, number]>;
  normals: Array<[number, number, number]>;
  indices: unknown;
}

export const AlgorithmicGeometryPointCloudProcessingNode: NodeDefinition<
  PointCloudProcessingInputs,
  PointCloudProcessingOutputs,
  PointCloudProcessingParams
> = {
  id: 'Algorithmic::PointCloudProcessing',
  category: 'Algorithmic',
  label: 'PointCloudProcessing',
  description: 'Process and filter point clouds',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    processed: {
      type: 'Point[]',
      label: 'Processed',
    },
    normals: {
      type: 'Vector[]',
      label: 'Normals',
    },
    indices: {
      type: 'number[]',
      label: 'Indices',
    },
  },
  params: {
    operation: {
      type: 'enum',
      label: 'Operation',
      default: 'filter',
      options: ['filter', 'downsample', 'normal', 'cluster'],
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 1,
      min: 0.1,
      max: 10,
    },
    neighbors: {
      type: 'number',
      label: 'Neighbors',
      default: 6,
      min: 3,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pointCloudProcessing',
      params: {
        points: inputs.points,
        operation: params.operation,
        radius: params.radius,
        neighbors: params.neighbors,
      },
    });

    return {
      processed: results.processed,
      normals: results.normals,
      indices: results.indices,
    };
  },
};
