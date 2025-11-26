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
  branches: Wire[];
}

export const LSystem3DNode: NodeDefinition<LSystem3DInputs, LSystem3DOutputs, LSystem3DParams> = {
  type: 'Patterns::LSystem3D',
  category: 'Patterns',
  subcategory: 'L-Systems',

  metadata: {
    label: 'LSystem3D',
    description: '3D L-system generator',
  },

  params: {
    axiom: {
      default: 'F',
    },
    rules: {
      default: 'F=F[+F]F[-F]F',
    },
    angle: {
      default: 25,
      min: 0,
      max: 360,
    },
    iterations: {
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
  },

  inputs: {
    startPoint: 'Point',
  },

  outputs: {
    branches: 'Wire[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'lsystem3D',
      params: {
        startPoint: inputs.startPoint,
        axiom: params.axiom,
        rules: params.rules,
        angle: params.angle,
        iterations: params.iterations,
      },
    });

    return {
      branches: result,
    };
  },
};
