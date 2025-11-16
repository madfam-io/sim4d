import type { NodeDefinition } from '@brepflow/types';

interface FillHolesParams {
  maxHoleSize: number;
  fillMethod: string;
}

interface FillHolesInputs {
  mesh: unknown;
}

interface FillHolesOutputs {
  filled: unknown;
  holesCount: unknown;
}

export const MeshRepairFillHolesNode: NodeDefinition<
  FillHolesInputs,
  FillHolesOutputs,
  FillHolesParams
> = {
  id: 'Mesh::FillHoles',
  type: 'Mesh::FillHoles',
  category: 'Mesh',
  label: 'FillHoles',
  description: 'Fill mesh holes',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    filled: {
      type: 'Mesh',
      label: 'Filled',
    },
    holesCount: {
      type: 'number',
      label: 'Holes Count',
    },
  },
  params: {
    maxHoleSize: {
      type: 'number',
      label: 'Max Hole Size',
      default: 100,
      min: 1,
      max: 10000,
    },
    fillMethod: {
      type: 'enum',
      label: 'Fill Method',
      default: 'smooth',
      options: ['flat', 'smooth', 'curvature'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fillHoles',
      params: {
        mesh: inputs.mesh,
        maxHoleSize: params.maxHoleSize,
        fillMethod: params.fillMethod,
      },
    });

    return {
      filled: results.filled,
      holesCount: results.holesCount,
    };
  },
};
