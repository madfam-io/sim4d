import type { NodeDefinition } from '@brepflow/types';

interface NurbsSurfaceParams {
  degreeU: number;
  degreeV: number;
  periodicU: boolean;
  periodicV: boolean;
}

interface NurbsSurfaceInputs {
  controlPoints: unknown;
  weights?: unknown;
  knotsU?: unknown;
  knotsV?: unknown;
}

interface NurbsSurfaceOutputs {
  surface: unknown;
}

export const SurfaceNURBSNurbsSurfaceNode: NodeDefinition<
  NurbsSurfaceInputs,
  NurbsSurfaceOutputs,
  NurbsSurfaceParams
> = {
  id: 'Surface::NurbsSurface',
  category: 'Surface',
  label: 'NurbsSurface',
  description: 'Create NURBS surface from control points',
  inputs: {
    controlPoints: {
      type: 'Point[][]',
      label: 'Control Points',
      required: true,
    },
    weights: {
      type: 'number[][]',
      label: 'Weights',
      optional: true,
    },
    knotsU: {
      type: 'number[]',
      label: 'Knots U',
      optional: true,
    },
    knotsV: {
      type: 'number[]',
      label: 'Knots V',
      optional: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {
    degreeU: {
      type: 'number',
      label: 'Degree U',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    degreeV: {
      type: 'number',
      label: 'Degree V',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    periodicU: {
      type: 'boolean',
      label: 'Periodic U',
      default: false,
    },
    periodicV: {
      type: 'boolean',
      label: 'Periodic V',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'nurbsSurface',
      params: {
        controlPoints: inputs.controlPoints,
        weights: inputs.weights,
        knotsU: inputs.knotsU,
        knotsV: inputs.knotsV,
        degreeU: params.degreeU,
        degreeV: params.degreeV,
        periodicU: params.periodicU,
        periodicV: params.periodicV,
      },
    });

    return {
      surface: result,
    };
  },
};
