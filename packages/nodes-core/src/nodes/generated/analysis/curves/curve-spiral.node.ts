import type { NodeDefinition } from '@sim4d/types';

interface CurveSpiralParams {
  tolerance: number;
  showCenter: boolean;
}

interface CurveSpiralInputs {
  curve: unknown;
}

interface CurveSpiralOutputs {
  isSpiral: unknown;
  center: [number, number, number];
  pitch: unknown;
  turns: unknown;
}

export const AnalysisCurvesCurveSpiralNode: NodeDefinition<
  CurveSpiralInputs,
  CurveSpiralOutputs,
  CurveSpiralParams
> = {
  id: 'Analysis::CurveSpiral',
  category: 'Analysis',
  label: 'CurveSpiral',
  description: 'Analyze spiral properties',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    isSpiral: {
      type: 'boolean',
      label: 'Is Spiral',
    },
    center: {
      type: 'Point',
      label: 'Center',
    },
    pitch: {
      type: 'number',
      label: 'Pitch',
    },
    turns: {
      type: 'number',
      label: 'Turns',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    showCenter: {
      type: 'boolean',
      label: 'Show Center',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveSpiral',
      params: {
        curve: inputs.curve,
        tolerance: params.tolerance,
        showCenter: params.showCenter,
      },
    });

    return {
      isSpiral: results.isSpiral,
      center: results.center,
      pitch: results.pitch,
      turns: results.turns,
    };
  },
};
