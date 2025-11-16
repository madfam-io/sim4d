import type { NodeDefinition } from '@brepflow/types';

interface InsulatedWallParams {
  insulationType: string;
  rValue: number;
}

interface InsulatedWallInputs {
  wallCavity: unknown;
}

interface InsulatedWallOutputs {
  insulatedWall: unknown;
}

export const ArchitectureWallsInsulatedWallNode: NodeDefinition<
  InsulatedWallInputs,
  InsulatedWallOutputs,
  InsulatedWallParams
> = {
  id: 'Architecture::InsulatedWall',
  category: 'Architecture',
  label: 'InsulatedWall',
  description: 'Wall with insulation layers',
  inputs: {
    wallCavity: {
      type: 'Shape',
      label: 'Wall Cavity',
      required: true,
    },
  },
  outputs: {
    insulatedWall: {
      type: 'Shape',
      label: 'Insulated Wall',
    },
  },
  params: {
    insulationType: {
      type: 'enum',
      label: 'Insulation Type',
      default: 'batt',
      options: ['batt', 'rigid', 'spray', 'blown'],
    },
    rValue: {
      type: 'number',
      label: 'R Value',
      default: 19,
      min: 5,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'insulatedWall',
      params: {
        wallCavity: inputs.wallCavity,
        insulationType: params.insulationType,
        rValue: params.rValue,
      },
    });

    return {
      insulatedWall: result,
    };
  },
};
