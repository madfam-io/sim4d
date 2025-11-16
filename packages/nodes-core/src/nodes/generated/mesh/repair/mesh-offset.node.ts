import type { NodeDefinition } from '@brepflow/types';

interface MeshOffsetParams {
  offsetDistance: number;
  solidify: boolean;
}

interface MeshOffsetInputs {
  mesh: unknown;
}

interface MeshOffsetOutputs {
  offset: unknown;
}

export const MeshRepairMeshOffsetNode: NodeDefinition<
  MeshOffsetInputs,
  MeshOffsetOutputs,
  MeshOffsetParams
> = {
  id: 'Mesh::MeshOffset',
  category: 'Mesh',
  label: 'MeshOffset',
  description: 'Offset mesh surface',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    offset: {
      type: 'Mesh',
      label: 'Offset',
    },
  },
  params: {
    offsetDistance: {
      type: 'number',
      label: 'Offset Distance',
      default: 1,
      min: -100,
      max: 100,
    },
    solidify: {
      type: 'boolean',
      label: 'Solidify',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'meshOffset',
      params: {
        mesh: inputs.mesh,
        offsetDistance: params.offsetDistance,
        solidify: params.solidify,
      },
    });

    return {
      offset: result,
    };
  },
};
