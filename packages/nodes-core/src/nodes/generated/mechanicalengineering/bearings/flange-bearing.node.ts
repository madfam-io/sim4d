import type { NodeDefinition } from '@brepflow/types';

interface FlangeBearingParams {
  boreDiameter: number;
  flangeDiameter: number;
  thickness: number;
  mountingHoles: number;
}

interface FlangeBearingInputs {
  center: [number, number, number];
}

interface FlangeBearingOutputs {
  bearing: unknown;
  flange: unknown;
  holes: unknown;
}

export const MechanicalEngineeringBearingsFlangeBearingNode: NodeDefinition<
  FlangeBearingInputs,
  FlangeBearingOutputs,
  FlangeBearingParams
> = {
  id: 'MechanicalEngineering::FlangeBearing',
  category: 'MechanicalEngineering',
  label: 'FlangeBearing',
  description: 'Create flanged bearing unit',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    bearing: {
      type: 'Shape',
      label: 'Bearing',
    },
    flange: {
      type: 'Face',
      label: 'Flange',
    },
    holes: {
      type: 'Wire[]',
      label: 'Holes',
    },
  },
  params: {
    boreDiameter: {
      type: 'number',
      label: 'Bore Diameter',
      default: 12,
      min: 5,
      max: 80,
    },
    flangeDiameter: {
      type: 'number',
      label: 'Flange Diameter',
      default: 40,
      min: 20,
      max: 150,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 8,
      min: 3,
      max: 30,
    },
    mountingHoles: {
      type: 'number',
      label: 'Mounting Holes',
      default: 4,
      min: 3,
      max: 8,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'flangeBearing',
      params: {
        center: inputs.center,
        boreDiameter: params.boreDiameter,
        flangeDiameter: params.flangeDiameter,
        thickness: params.thickness,
        mountingHoles: params.mountingHoles,
      },
    });

    return {
      bearing: results.bearing,
      flange: results.flange,
      holes: results.holes,
    };
  },
};
