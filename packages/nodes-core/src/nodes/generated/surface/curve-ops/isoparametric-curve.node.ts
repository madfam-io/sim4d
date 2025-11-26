import type { NodeDefinition } from '@sim4d/types';

interface IsoparametricCurveParams {
  direction: string;
  parameter: number;
}

interface IsoparametricCurveInputs {
  surface: unknown;
}

interface IsoparametricCurveOutputs {
  isoCurve: unknown;
}

export const SurfaceCurveOpsIsoparametricCurveNode: NodeDefinition<
  IsoparametricCurveInputs,
  IsoparametricCurveOutputs,
  IsoparametricCurveParams
> = {
  id: 'Surface::IsoparametricCurve',
  category: 'Surface',
  label: 'IsoparametricCurve',
  description: 'Extract isoparametric curve',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    isoCurve: {
      type: 'Wire',
      label: 'Iso Curve',
    },
  },
  params: {
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'U',
      options: ['U', 'V'],
    },
    parameter: {
      type: 'number',
      label: 'Parameter',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'isoparametricCurve',
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
