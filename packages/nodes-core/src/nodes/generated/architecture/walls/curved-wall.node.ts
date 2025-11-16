import type { NodeDefinition } from '@brepflow/types';

interface CurvedWallParams {
  height: number;
  thickness: number;
  segments: number;
}

interface CurvedWallInputs {
  curve: unknown;
}

interface CurvedWallOutputs {
  wall: unknown;
}

export const ArchitectureWallsCurvedWallNode: NodeDefinition<
  CurvedWallInputs,
  CurvedWallOutputs,
  CurvedWallParams
> = {
  id: 'Architecture::CurvedWall',
  category: 'Architecture',
  label: 'CurvedWall',
  description: 'Create curved wall segment',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    wall: {
      type: 'Shape',
      label: 'Wall',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 3000,
      min: 100,
      max: 10000,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 200,
      min: 50,
      max: 500,
    },
    segments: {
      type: 'number',
      label: 'Segments',
      default: 10,
      min: 3,
      max: 50,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'curvedWall',
      params: {
        curve: inputs.curve,
        height: params.height,
        thickness: params.thickness,
        segments: params.segments,
      },
    });

    return {
      wall: result,
    };
  },
};
