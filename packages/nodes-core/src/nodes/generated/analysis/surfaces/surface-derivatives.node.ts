import type { NodeDefinition } from '@brepflow/types';

interface SurfaceDerivativesParams {
  u: number;
  v: number;
  order: number;
  vectorScale: number;
}

interface SurfaceDerivativesInputs {
  surface: unknown;
}

interface SurfaceDerivativesOutputs {
  point: [number, number, number];
  duVector: [number, number, number];
  dvVector: [number, number, number];
  normal: [number, number, number];
}

export const AnalysisSurfacesSurfaceDerivativesNode: NodeDefinition<
  SurfaceDerivativesInputs,
  SurfaceDerivativesOutputs,
  SurfaceDerivativesParams
> = {
  id: 'Analysis::SurfaceDerivatives',
  category: 'Analysis',
  label: 'SurfaceDerivatives',
  description: 'Calculate surface derivatives',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    point: {
      type: 'Point',
      label: 'Point',
    },
    duVector: {
      type: 'Vector',
      label: 'Du Vector',
    },
    dvVector: {
      type: 'Vector',
      label: 'Dv Vector',
    },
    normal: {
      type: 'Vector',
      label: 'Normal',
    },
  },
  params: {
    u: {
      type: 'number',
      label: 'U',
      default: 0.5,
      min: 0,
      max: 1,
    },
    v: {
      type: 'number',
      label: 'V',
      default: 0.5,
      min: 0,
      max: 1,
    },
    order: {
      type: 'number',
      label: 'Order',
      default: 2,
      min: 1,
      max: 3,
    },
    vectorScale: {
      type: 'number',
      label: 'Vector Scale',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceDerivatives',
      params: {
        surface: inputs.surface,
        u: params.u,
        v: params.v,
        order: params.order,
        vectorScale: params.vectorScale,
      },
    });

    return {
      point: results.point,
      duVector: results.duVector,
      dvVector: results.dvVector,
      normal: results.normal,
    };
  },
};
