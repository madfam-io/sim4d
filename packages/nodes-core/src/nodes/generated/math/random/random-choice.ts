import type { NodeDefinition } from '@sim4d/types';

interface RandomChoiceParams {
  seed: number;
}

interface RandomChoiceInputs {
  choices: unknown;
}

interface RandomChoiceOutputs {
  choice: unknown;
}

export const MathRandomRandomChoiceNode: NodeDefinition<
  RandomChoiceInputs,
  RandomChoiceOutputs,
  RandomChoiceParams
> = {
  id: 'Math::RandomChoice',
  type: 'Math::RandomChoice',
  category: 'Math',
  label: 'RandomChoice',
  description: 'Random choice from list',
  inputs: {
    choices: {
      type: 'Data[]',
      label: 'Choices',
      required: true,
    },
  },
  outputs: {
    choice: {
      type: 'Data',
      label: 'Choice',
    },
  },
  params: {
    seed: {
      type: 'number',
      label: 'Seed',
      default: -1,
      min: -1,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathRandomChoice',
      params: {
        choices: inputs.choices,
        seed: params.seed,
      },
    });

    return {
      choice: result,
    };
  },
};
