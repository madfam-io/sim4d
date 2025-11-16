import type { NodeDefinition } from '@brepflow/types';

interface MeshBooleanParams {
  operation: string;
  tolerance: number;
}

interface MeshBooleanInputs {
  mesh1: unknown;
  mesh2: unknown;
}

interface MeshBooleanOutputs {
  result: unknown;
}

export const MeshRepairMeshBooleanNode: NodeDefinition<
  MeshBooleanInputs,
  MeshBooleanOutputs,
  MeshBooleanParams
> = {
  id: 'Mesh::MeshBoolean',
  category: 'Mesh',
  label: 'MeshBoolean',
  description: 'Boolean operations on meshes',
  inputs: {
    mesh1: {
      type: 'Mesh',
      label: 'Mesh1',
      required: true,
    },
    mesh2: {
      type: 'Mesh',
      label: 'Mesh2',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Mesh',
      label: 'Result',
    },
  },
  params: {
    operation: {
      type: 'enum',
      label: 'Operation',
      default: 'union',
      options: ['union', 'difference', 'intersection'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'meshBoolean',
      params: {
        mesh1: inputs.mesh1,
        mesh2: inputs.mesh2,
        operation: params.operation,
        tolerance: params.tolerance,
      },
    });

    return {
      result: result,
    };
  },
};
