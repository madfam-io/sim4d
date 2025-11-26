import type { NodeDefinition } from '@sim4d/types';

interface NeedleBearingParams {
  innerDiameter: number;
  outerDiameter: number;
  width: number;
  needleCount: number;
}

interface NeedleBearingInputs {
  center: [number, number, number];
}

interface NeedleBearingOutputs {
  bearing: unknown;
  needles: unknown;
}

export const MechanicalEngineeringBearingsNeedleBearingNode: NodeDefinition<
  NeedleBearingInputs,
  NeedleBearingOutputs,
  NeedleBearingParams
> = {
  id: 'MechanicalEngineering::NeedleBearing',
  type: 'MechanicalEngineering::NeedleBearing',
  category: 'MechanicalEngineering',
  label: 'NeedleBearing',
  description: 'Create needle bearing',
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
    needles: {
      type: 'Shape[]',
      label: 'Needles',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 15,
      min: 5,
      max: 100,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 21,
      min: 10,
      max: 150,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 12,
      min: 5,
      max: 50,
    },
    needleCount: {
      type: 'number',
      label: 'Needle Count',
      default: 20,
      min: 10,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'needleBearing',
      params: {
        center: inputs.center,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        width: params.width,
        needleCount: params.needleCount,
      },
    });

    return {
      bearing: results.bearing,
      needles: results.needles,
    };
  },
};
