import type { NodeDefinition } from '@sim4d/types';

interface StudWallParams {
  studSpacing: number;
  studWidth: number;
  studDepth: number;
}

interface StudWallInputs {
  outline: unknown;
}

interface StudWallOutputs {
  studFrame: unknown;
}

export const ArchitectureWallsStudWallNode: NodeDefinition<
  StudWallInputs,
  StudWallOutputs,
  StudWallParams
> = {
  id: 'Architecture::StudWall',
  type: 'Architecture::StudWall',
  category: 'Architecture',
  label: 'StudWall',
  description: 'Framed stud wall',
  inputs: {
    outline: {
      type: 'Wire',
      label: 'Outline',
      required: true,
    },
  },
  outputs: {
    studFrame: {
      type: 'Shape[]',
      label: 'Stud Frame',
    },
  },
  params: {
    studSpacing: {
      type: 'number',
      label: 'Stud Spacing',
      default: 400,
      min: 300,
      max: 600,
    },
    studWidth: {
      type: 'number',
      label: 'Stud Width',
      default: 90,
      min: 50,
      max: 200,
    },
    studDepth: {
      type: 'number',
      label: 'Stud Depth',
      default: 45,
      min: 35,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'studWall',
      params: {
        outline: inputs.outline,
        studSpacing: params.studSpacing,
        studWidth: params.studWidth,
        studDepth: params.studDepth,
      },
    });

    return {
      studFrame: result,
    };
  },
};
