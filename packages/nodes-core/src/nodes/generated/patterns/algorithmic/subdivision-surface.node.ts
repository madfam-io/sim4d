import type { NodeDefinition } from '@brepflow/types';

interface SubdivisionSurfaceParams {
  algorithm: string;
  iterations: number;
}

interface SubdivisionSurfaceInputs {
  mesh: unknown;
}

interface SubdivisionSurfaceOutputs {
  subdivided: unknown;
}

export const PatternsAlgorithmicSubdivisionSurfaceNode: NodeDefinition<
  SubdivisionSurfaceInputs,
  SubdivisionSurfaceOutputs,
  SubdivisionSurfaceParams
> = {
  id: 'Patterns::SubdivisionSurface',
  category: 'Patterns',
  label: 'SubdivisionSurface',
  description: 'Subdivision surface algorithms',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    subdivided: {
      type: 'Mesh',
      label: 'Subdivided',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'catmull-clark',
      options: ['catmull-clark', 'loop', 'doo-sabin', 'butterfly'],
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 2,
      min: 1,
      max: 5,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'subdivisionSurface',
      params: {
        mesh: inputs.mesh,
        algorithm: params.algorithm,
        iterations: params.iterations,
      },
    });

    return {
      subdivided: result,
    };
  },
};
