import type { NodeDefinition } from '@sim4d/types';

interface CurveDerivativesParams {
  parameter: number;
  order: number;
  vectorScale: number;
}

interface CurveDerivativesInputs {
  curve: unknown;
}

interface CurveDerivativesOutputs {
  point: [number, number, number];
  firstDerivative: [number, number, number];
  secondDerivative: [number, number, number];
  thirdDerivative: [number, number, number];
}

export const AnalysisCurvesCurveDerivativesNode: NodeDefinition<
  CurveDerivativesInputs,
  CurveDerivativesOutputs,
  CurveDerivativesParams
> = {
  id: 'Analysis::CurveDerivatives',
  category: 'Analysis',
  label: 'CurveDerivatives',
  description: 'Calculate curve derivatives',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    point: {
      type: 'Point',
      label: 'Point',
    },
    firstDerivative: {
      type: 'Vector',
      label: 'First Derivative',
    },
    secondDerivative: {
      type: 'Vector',
      label: 'Second Derivative',
    },
    thirdDerivative: {
      type: 'Vector',
      label: 'Third Derivative',
    },
  },
  params: {
    parameter: {
      type: 'number',
      label: 'Parameter',
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
      type: 'curveDerivatives',
      params: {
        curve: inputs.curve,
        parameter: params.parameter,
        order: params.order,
        vectorScale: params.vectorScale,
      },
    });

    return {
      point: results.point,
      firstDerivative: results.firstDerivative,
      secondDerivative: results.secondDerivative,
      thirdDerivative: results.thirdDerivative,
    };
  },
};
