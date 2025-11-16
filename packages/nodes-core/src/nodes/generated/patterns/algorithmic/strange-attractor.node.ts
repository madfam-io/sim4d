import type { NodeDefinition } from '@brepflow/types';

interface StrangeAttractorParams {
  type: string;
  iterations: number;
  dt: number;
}

interface StrangeAttractorInputs {
  initial: [number, number, number];
}

interface StrangeAttractorOutputs {
  attractor: Array<[number, number, number]>;
  trajectory: unknown;
}

export const PatternsAlgorithmicStrangeAttractorNode: NodeDefinition<
  StrangeAttractorInputs,
  StrangeAttractorOutputs,
  StrangeAttractorParams
> = {
  id: 'Patterns::StrangeAttractor',
  category: 'Patterns',
  label: 'StrangeAttractor',
  description: 'Strange attractor patterns',
  inputs: {
    initial: {
      type: 'Point',
      label: 'Initial',
      required: true,
    },
  },
  outputs: {
    attractor: {
      type: 'Point[]',
      label: 'Attractor',
    },
    trajectory: {
      type: 'Wire',
      label: 'Trajectory',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'lorenz',
      options: ['lorenz', 'rossler', 'henon', 'duffing'],
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 10000,
      min: 100,
      max: 100000,
      step: 100,
    },
    dt: {
      type: 'number',
      label: 'Dt',
      default: 0.01,
      min: 0.001,
      max: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'strangeAttractor',
      params: {
        initial: inputs.initial,
        type: params.type,
        iterations: params.iterations,
        dt: params.dt,
      },
    });

    return {
      attractor: results.attractor,
      trajectory: results.trajectory,
    };
  },
};
