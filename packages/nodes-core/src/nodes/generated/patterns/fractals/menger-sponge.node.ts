import type { NodeDefinition } from '@brepflow/types';

interface MengerSpongeParams {
  iterations: number;
}

interface MengerSpongeInputs {
  cube: unknown;
}

interface MengerSpongeOutputs {
  fractal: unknown;
}

export const PatternsFractalsMengerSpongeNode: NodeDefinition<
  MengerSpongeInputs,
  MengerSpongeOutputs,
  MengerSpongeParams
> = {
  id: 'Patterns::MengerSponge',
  category: 'Patterns',
  label: 'MengerSponge',
  description: 'Menger sponge 3D fractal',
  inputs: {
    cube: {
      type: 'Shape',
      label: 'Cube',
      required: true,
    },
  },
  outputs: {
    fractal: {
      type: 'Shape',
      label: 'Fractal',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 0,
      max: 4,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mengerSponge',
      params: {
        cube: inputs.cube,
        iterations: params.iterations,
      },
    });

    return {
      fractal: result,
    };
  },
};
