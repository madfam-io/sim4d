import type { NodeDefinition } from '@brepflow/types';

interface EpoxyFloorParams {
  thickness: number;
  texture: string;
}

interface EpoxyFloorInputs {
  floorSurface: unknown;
}

interface EpoxyFloorOutputs {
  epoxyFloor: unknown;
}

export const ArchitectureFloorsEpoxyFloorNode: NodeDefinition<
  EpoxyFloorInputs,
  EpoxyFloorOutputs,
  EpoxyFloorParams
> = {
  id: 'Architecture::EpoxyFloor',
  category: 'Architecture',
  label: 'EpoxyFloor',
  description: 'Epoxy floor coating system',
  inputs: {
    floorSurface: {
      type: 'Face',
      label: 'Floor Surface',
      required: true,
    },
  },
  outputs: {
    epoxyFloor: {
      type: 'Face',
      label: 'Epoxy Floor',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 3,
      min: 2,
      max: 10,
    },
    texture: {
      type: 'enum',
      label: 'Texture',
      default: 'smooth',
      options: ['smooth', 'orange-peel', 'quartz', 'flake'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'epoxyFloor',
      params: {
        floorSurface: inputs.floorSurface,
        thickness: params.thickness,
        texture: params.texture,
      },
    });

    return {
      epoxyFloor: result,
    };
  },
};
