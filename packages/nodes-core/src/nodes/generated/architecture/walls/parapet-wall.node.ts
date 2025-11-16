import type { NodeDefinition } from '@brepflow/types';

interface ParapetWallParams {
  height: number;
  coping: boolean;
  copingOverhang: number;
}

interface ParapetWallInputs {
  roofEdge: unknown;
}

interface ParapetWallOutputs {
  parapet: unknown;
}

export const ArchitectureWallsParapetWallNode: NodeDefinition<
  ParapetWallInputs,
  ParapetWallOutputs,
  ParapetWallParams
> = {
  id: 'Architecture::ParapetWall',
  category: 'Architecture',
  label: 'ParapetWall',
  description: 'Roof parapet wall',
  inputs: {
    roofEdge: {
      type: 'Wire',
      label: 'Roof Edge',
      required: true,
    },
  },
  outputs: {
    parapet: {
      type: 'Shape',
      label: 'Parapet',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 1000,
      min: 300,
      max: 2000,
    },
    coping: {
      type: 'boolean',
      label: 'Coping',
      default: true,
    },
    copingOverhang: {
      type: 'number',
      label: 'Coping Overhang',
      default: 50,
      min: 0,
      max: 150,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'parapetWall',
      params: {
        roofEdge: inputs.roofEdge,
        height: params.height,
        coping: params.coping,
        copingOverhang: params.copingOverhang,
      },
    });

    return {
      parapet: result,
    };
  },
};
