import type { NodeDefinition } from '@sim4d/types';

interface DragonCurveParams {
  iterations: number;
  angle: number;
}

interface DragonCurveInputs {
  startSegment: unknown;
}

interface DragonCurveOutputs {
  curve: unknown;
}

export const PatternsFractalsDragonCurveNode: NodeDefinition<
  DragonCurveInputs,
  DragonCurveOutputs,
  DragonCurveParams
> = {
  id: 'Patterns::DragonCurve',
  category: 'Patterns',
  label: 'DragonCurve',
  description: 'Dragon curve fractal',
  inputs: {
    startSegment: {
      type: 'Edge',
      label: 'Start Segment',
      required: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 10,
      min: 0,
      max: 15,
      step: 1,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'dragonCurve',
      params: {
        startSegment: inputs.startSegment,
        iterations: params.iterations,
        angle: params.angle,
      },
    });

    return {
      curve: result,
    };
  },
};
