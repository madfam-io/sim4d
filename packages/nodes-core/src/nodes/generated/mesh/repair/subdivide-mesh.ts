import type { NodeDefinition } from '@brepflow/types';

interface SubdivideMeshParams {
  subdivisionType: string;
  levels: number;
}

interface SubdivideMeshInputs {
  mesh: unknown;
}

interface SubdivideMeshOutputs {
  subdivided: unknown;
}

export const MeshRepairSubdivideMeshNode: NodeDefinition<
  SubdivideMeshInputs,
  SubdivideMeshOutputs,
  SubdivideMeshParams
> = {
  id: 'Mesh::SubdivideMesh',
  type: 'Mesh::SubdivideMesh',
  category: 'Mesh',
  label: 'SubdivideMesh',
  description: 'Subdivide mesh faces',
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
    subdivisionType: {
      type: 'enum',
      label: 'Subdivision Type',
      default: 'loop',
      options: ['loop', 'catmull-clark', 'simple'],
    },
    levels: {
      type: 'number',
      label: 'Levels',
      default: 1,
      min: 1,
      max: 5,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'subdivideMesh',
      params: {
        mesh: inputs.mesh,
        subdivisionType: params.subdivisionType,
        levels: params.levels,
      },
    });

    return {
      subdivided: result,
    };
  },
};
