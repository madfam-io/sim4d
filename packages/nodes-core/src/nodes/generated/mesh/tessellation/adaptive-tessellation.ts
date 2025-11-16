import type { NodeDefinition } from '@brepflow/types';

interface AdaptiveTessellationParams {
  minEdgeLength: number;
  maxEdgeLength: number;
  curvatureFactor: number;
}

interface AdaptiveTessellationInputs {
  shape: unknown;
}

interface AdaptiveTessellationOutputs {
  mesh: unknown;
}

export const MeshTessellationAdaptiveTessellationNode: NodeDefinition<
  AdaptiveTessellationInputs,
  AdaptiveTessellationOutputs,
  AdaptiveTessellationParams
> = {
  id: 'Mesh::AdaptiveTessellation',
  type: 'Mesh::AdaptiveTessellation',
  category: 'Mesh',
  label: 'AdaptiveTessellation',
  description: 'Adaptive mesh generation',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
  },
  params: {
    minEdgeLength: {
      type: 'number',
      label: 'Min Edge Length',
      default: 0.1,
      min: 0.001,
      max: 100,
    },
    maxEdgeLength: {
      type: 'number',
      label: 'Max Edge Length',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    curvatureFactor: {
      type: 'number',
      label: 'Curvature Factor',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'adaptiveTessellate',
      params: {
        shape: inputs.shape,
        minEdgeLength: params.minEdgeLength,
        maxEdgeLength: params.maxEdgeLength,
        curvatureFactor: params.curvatureFactor,
      },
    });

    return {
      mesh: result,
    };
  },
};
