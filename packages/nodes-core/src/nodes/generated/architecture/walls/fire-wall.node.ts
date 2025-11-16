import type { NodeDefinition } from '@brepflow/types';

interface FireWallParams {
  fireRating: string;
  thickness: number;
}

interface FireWallInputs {
  path: unknown;
}

interface FireWallOutputs {
  fireWall: unknown;
}

export const ArchitectureWallsFireWallNode: NodeDefinition<
  FireWallInputs,
  FireWallOutputs,
  FireWallParams
> = {
  id: 'Architecture::FireWall',
  category: 'Architecture',
  label: 'FireWall',
  description: 'Fire-rated wall assembly',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    fireWall: {
      type: 'Shape',
      label: 'Fire Wall',
    },
  },
  params: {
    fireRating: {
      type: 'enum',
      label: 'Fire Rating',
      default: '2-hour',
      options: ['1-hour', '2-hour', '3-hour', '4-hour'],
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 250,
      min: 200,
      max: 400,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fireWall',
      params: {
        path: inputs.path,
        fireRating: params.fireRating,
        thickness: params.thickness,
      },
    });

    return {
      fireWall: result,
    };
  },
};
