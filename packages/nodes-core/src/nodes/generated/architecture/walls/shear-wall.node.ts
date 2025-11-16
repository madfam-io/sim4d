import type { NodeDefinition } from '@brepflow/types';

interface ShearWallParams {
  thickness: number;
  reinforcementRatio: number;
}

interface ShearWallInputs {
  wallOutline: unknown;
}

interface ShearWallOutputs {
  shearWall: unknown;
  reinforcement: unknown;
}

export const ArchitectureWallsShearWallNode: NodeDefinition<
  ShearWallInputs,
  ShearWallOutputs,
  ShearWallParams
> = {
  id: 'Architecture::ShearWall',
  category: 'Architecture',
  label: 'ShearWall',
  description: 'Structural shear wall',
  inputs: {
    wallOutline: {
      type: 'Wire',
      label: 'Wall Outline',
      required: true,
    },
  },
  outputs: {
    shearWall: {
      type: 'Shape',
      label: 'Shear Wall',
    },
    reinforcement: {
      type: 'Wire[]',
      label: 'Reinforcement',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 300,
      min: 200,
      max: 500,
    },
    reinforcementRatio: {
      type: 'number',
      label: 'Reinforcement Ratio',
      default: 0.025,
      min: 0.01,
      max: 0.04,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'shearWall',
      params: {
        wallOutline: inputs.wallOutline,
        thickness: params.thickness,
        reinforcementRatio: params.reinforcementRatio,
      },
    });

    return {
      shearWall: results.shearWall,
      reinforcement: results.reinforcement,
    };
  },
};
