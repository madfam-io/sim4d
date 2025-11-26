import { NodeDefinition } from '@sim4d/types';

interface Params {
  axiom: string;
  rules: string;
  angle: number;
  iterations: number;
}
interface Inputs {
  startPoint: Point;
}
interface Outputs {
  pattern: Wire;
}

export const LSystem2DNode: NodeDefinition<LSystem2DInputs, LSystem2DOutputs, LSystem2DParams> = {
  type: 'Patterns::LSystem2D',
  category: 'Patterns',
  subcategory: 'L-Systems',

  metadata: {
    label: 'LSystem2D',
    description: '2D L-system generator',
  },

  params: {
    axiom: {
      default: 'F',
    },
    rules: {
      default: 'F=F+F-F-F+F',
    },
    angle: {
      default: 90,
      min: 0,
      max: 360,
    },
    iterations: {
      default: 3,
      min: 1,
      max: 8,
      step: 1,
    },
  },

  inputs: {
    startPoint: 'Point',
  },

  outputs: {
    pattern: 'Wire',
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
