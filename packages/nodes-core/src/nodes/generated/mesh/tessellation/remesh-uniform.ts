import type { NodeDefinition } from '@brepflow/types';

interface RemeshUniformParams {
  targetEdgeLength: number;
  iterations: number;
  preserveFeatures: boolean;
}

interface RemeshUniformInputs {
  mesh: unknown;
}

interface RemeshUniformOutputs {
  remeshed: unknown;
}

export const MeshTessellationRemeshUniformNode: NodeDefinition<
  RemeshUniformInputs,
  RemeshUniformOutputs,
  RemeshUniformParams
> = {
  id: 'Mesh::RemeshUniform',
  type: 'Mesh::RemeshUniform',
  category: 'Mesh',
  label: 'RemeshUniform',
  description: 'Uniform remeshing',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    remeshed: {
      type: 'Mesh',
      label: 'Remeshed',
    },
  },
  params: {
    targetEdgeLength: {
      type: 'number',
      label: 'Target Edge Length',
      default: 1,
      min: 0.01,
      max: 100,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    preserveFeatures: {
      type: 'boolean',
      label: 'Preserve Features',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'remeshUniform',
      params: {
        mesh: inputs.mesh,
        targetEdgeLength: params.targetEdgeLength,
        iterations: params.iterations,
        preserveFeatures: params.preserveFeatures,
      },
    });

    return {
      remeshed: result,
    };
  },
};
