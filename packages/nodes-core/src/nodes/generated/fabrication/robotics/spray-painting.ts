import type { NodeDefinition } from '@brepflow/types';

interface SprayPaintingParams {
  sprayWidth: number;
  overlap: number;
  standoffDistance: number;
}

interface SprayPaintingInputs {
  surface: unknown;
}

interface SprayPaintingOutputs {
  sprayPath: unknown;
}

export const FabricationRoboticsSprayPaintingNode: NodeDefinition<
  SprayPaintingInputs,
  SprayPaintingOutputs,
  SprayPaintingParams
> = {
  id: 'Fabrication::SprayPainting',
  type: 'Fabrication::SprayPainting',
  category: 'Fabrication',
  label: 'SprayPainting',
  description: 'Robotic spray painting',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    sprayPath: {
      type: 'Transform[]',
      label: 'Spray Path',
    },
  },
  params: {
    sprayWidth: {
      type: 'number',
      label: 'Spray Width',
      default: 100,
      min: 10,
      max: 500,
    },
    overlap: {
      type: 'number',
      label: 'Overlap',
      default: 0.5,
      min: 0,
      max: 0.9,
    },
    standoffDistance: {
      type: 'number',
      label: 'Standoff Distance',
      default: 200,
      min: 50,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sprayPainting',
      params: {
        surface: inputs.surface,
        sprayWidth: params.sprayWidth,
        overlap: params.overlap,
        standoffDistance: params.standoffDistance,
      },
    });

    return {
      sprayPath: result,
    };
  },
};
