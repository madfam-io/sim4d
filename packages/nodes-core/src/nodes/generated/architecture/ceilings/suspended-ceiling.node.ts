import type { NodeDefinition } from '@sim4d/types';

interface SuspendedCeilingParams {
  tileSize: string;
  suspensionHeight: number;
}

interface SuspendedCeilingInputs {
  roomBoundary: unknown;
}

interface SuspendedCeilingOutputs {
  ceiling: unknown;
  grid: unknown;
  tiles: unknown;
}

export const ArchitectureCeilingsSuspendedCeilingNode: NodeDefinition<
  SuspendedCeilingInputs,
  SuspendedCeilingOutputs,
  SuspendedCeilingParams
> = {
  id: 'Architecture::SuspendedCeiling',
  category: 'Architecture',
  label: 'SuspendedCeiling',
  description: 'Suspended ceiling grid',
  inputs: {
    roomBoundary: {
      type: 'Wire',
      label: 'Room Boundary',
      required: true,
    },
  },
  outputs: {
    ceiling: {
      type: 'Shape',
      label: 'Ceiling',
    },
    grid: {
      type: 'Wire[]',
      label: 'Grid',
    },
    tiles: {
      type: 'Face[]',
      label: 'Tiles',
    },
  },
  params: {
    tileSize: {
      type: 'enum',
      label: 'Tile Size',
      default: '600x600',
      options: ['600x600', '600x1200', '1200x1200'],
    },
    suspensionHeight: {
      type: 'number',
      label: 'Suspension Height',
      default: 300,
      min: 150,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'suspendedCeiling',
      params: {
        roomBoundary: inputs.roomBoundary,
        tileSize: params.tileSize,
        suspensionHeight: params.suspensionHeight,
      },
    });

    return {
      ceiling: results.ceiling,
      grid: results.grid,
      tiles: results.tiles,
    };
  },
};
