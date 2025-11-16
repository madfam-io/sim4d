import type { NodeDefinition } from '@brepflow/types';

interface MarkovChainParams {
  states: number;
  steps: number;
  seed: number;
}

interface MarkovChainInputs {
  transitionMatrix: unknown;
}

interface MarkovChainOutputs {
  sequence: number[];
  pattern: unknown;
}

export const PatternsProceduralMarkovChainNode: NodeDefinition<
  MarkovChainInputs,
  MarkovChainOutputs,
  MarkovChainParams
> = {
  id: 'Patterns::MarkovChain',
  category: 'Patterns',
  label: 'MarkovChain',
  description: 'Markov chain pattern',
  inputs: {
    transitionMatrix: {
      type: 'Data',
      label: 'Transition Matrix',
      required: true,
    },
  },
  outputs: {
    sequence: {
      type: 'Number[]',
      label: 'Sequence',
    },
    pattern: {
      type: 'Wire',
      label: 'Pattern',
    },
  },
  params: {
    states: {
      type: 'number',
      label: 'States',
      default: 5,
      min: 2,
      max: 10,
      step: 1,
    },
    steps: {
      type: 'number',
      label: 'Steps',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    seed: {
      type: 'number',
      label: 'Seed',
      default: 0,
      min: 0,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'markovChain',
      params: {
        transitionMatrix: inputs.transitionMatrix,
        states: params.states,
        steps: params.steps,
        seed: params.seed,
      },
    });

    return {
      sequence: results.sequence,
      pattern: results.pattern,
    };
  },
};
