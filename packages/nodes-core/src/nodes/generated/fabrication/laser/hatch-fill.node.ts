import type { NodeDefinition } from '@sim4d/types';

interface HatchFillParams {
  angle: number;
  spacing: number;
  crosshatch: boolean;
}

interface HatchFillInputs {
  region: unknown;
}

interface HatchFillOutputs {
  hatchLines: unknown;
}

export const FabricationLaserHatchFillNode: NodeDefinition<
  HatchFillInputs,
  HatchFillOutputs,
  HatchFillParams
> = {
  id: 'Fabrication::HatchFill',
  category: 'Fabrication',
  label: 'HatchFill',
  description: 'Generate hatch fill pattern',
  inputs: {
    region: {
      type: 'Face',
      label: 'Region',
      required: true,
    },
  },
  outputs: {
    hatchLines: {
      type: 'Wire[]',
      label: 'Hatch Lines',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 45,
      min: 0,
      max: 180,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 1,
      min: 0.1,
      max: 10,
    },
    crosshatch: {
      type: 'boolean',
      label: 'Crosshatch',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'hatchFill',
      params: {
        region: inputs.region,
        angle: params.angle,
        spacing: params.spacing,
        crosshatch: params.crosshatch,
      },
    });

    return {
      hatchLines: result,
    };
  },
};
