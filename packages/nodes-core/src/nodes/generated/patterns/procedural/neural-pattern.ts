import type { NodeDefinition } from '@brepflow/types';

interface NeuralPatternParams {
  neurons: number;
  connections: number;
}

interface NeuralPatternInputs {
  inputPoints: Array<[number, number, number]>;
}

interface NeuralPatternOutputs {
  network: unknown;
}

export const PatternsProceduralNeuralPatternNode: NodeDefinition<
  NeuralPatternInputs,
  NeuralPatternOutputs,
  NeuralPatternParams
> = {
  id: 'Patterns::NeuralPattern',
  type: 'Patterns::NeuralPattern',
  category: 'Patterns',
  label: 'NeuralPattern',
  description: 'Neural network pattern',
  inputs: {
    inputPoints: {
      type: 'Point[]',
      label: 'Input Points',
      required: true,
    },
  },
  outputs: {
    network: {
      type: 'Wire[]',
      label: 'Network',
    },
  },
  params: {
    neurons: {
      type: 'number',
      label: 'Neurons',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    connections: {
      type: 'number',
      label: 'Connections',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'neuralPattern',
      params: {
        inputPoints: inputs.inputPoints,
        neurons: params.neurons,
        connections: params.connections,
      },
    });

    return {
      network: result,
    };
  },
};
