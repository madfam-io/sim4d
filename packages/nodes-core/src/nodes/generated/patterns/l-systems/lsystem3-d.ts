import type { NodeDefinition } from '@sim4d/types';

interface LSystem3DParams {
  axiom: string;
  rules: string;
  angle: number;
  iterations: number;
}

interface LSystem3DInputs {
  startPoint: [number, number, number];
}

interface LSystem3DOutputs {
  branches: unknown;
}

export const PatternsLSystemsLSystem3DNode: NodeDefinition<
  LSystem3DInputs,
  LSystem3DOutputs,
  LSystem3DParams
> = {
  id: 'Patterns::LSystem3D',
  type: 'Patterns::LSystem3D',
  category: 'Patterns',
  label: 'LSystem3D',
  description: '3D L-system generator',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
  },
  outputs: {
    branches: {
      type: 'Wire[]',
      label: 'Branches',
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
      default: 'F=F[+F]F[-F]F',
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 25,
      min: 0,
      max: 360,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
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
