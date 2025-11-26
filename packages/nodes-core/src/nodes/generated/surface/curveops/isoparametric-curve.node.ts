import { NodeDefinition } from '@sim4d/types';

interface Params {
  direction: string;
  parameter: number;
}
interface Inputs {
  surface: Face;
}
interface Outputs {
  isoCurve: Wire;
}

export const IsoparametricCurveNode: NodeDefinition<
  IsoparametricCurveInputs,
  IsoparametricCurveOutputs,
  IsoparametricCurveParams
> = {
  type: 'Surface::IsoparametricCurve',
  category: 'Surface',
  subcategory: 'CurveOps',

  metadata: {
    label: 'IsoparametricCurve',
    description: 'Extract isoparametric curve',
  },

  params: {
    direction: {
      default: 'U',
      options: ['U', 'V'],
    },
    parameter: {
      default: 0.5,
      min: 0,
      max: 1,
    },
  },

  inputs: {
    surface: 'Face',
  },

  outputs: {
    isoCurve: 'Wire',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'ISOPARAMETRIC_CURVE',
      params: {
        surface: inputs.surface,
        direction: params.direction,
        parameter: params.parameter,
      },
    });

    return {
      isoCurve: result,
    };
  },
};
