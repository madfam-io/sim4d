import type { NodeDefinition } from '@sim4d/types';

interface LSystem2DParams {
  axiom: string;
  rules: string;
  angle: number;
  iterations: number;
}

interface LSystem2DInputs {
  startPoint: [number, number, number];
}

interface LSystem2DOutputs {
  pattern: unknown;
}

export const PatternsLSystemsLSystem2DNode: NodeDefinition<
  LSystem2DInputs,
  LSystem2DOutputs,
  LSystem2DParams
> = {
  id: 'Patterns::LSystem2D',
  type: 'Patterns::LSystem2D',
  category: 'Patterns',
  label: 'LSystem2D',
  description: '2D L-system generator',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire',
      label: 'Pattern',
    },
  },
  params: {
    axiom: {
      type: 'string',
      label: 'Axiom',
      default: 'F',
    },
    rules: {
      type: 'string',
      label: 'Rules',
      default: 'F=F+F-F-F+F',
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: 0,
      max: 360,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'lsystem2D',
      params: {
        startPoint: inputs.startPoint,
        axiom: params.axiom,
        rules: params.rules,
        angle: params.angle,
        iterations: params.iterations,
      },
    });

    return {
      pattern: result,
    };
  },
};
