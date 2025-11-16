import { NodeDefinition } from '@brepflow/types';

interface Params {
  hiddenLayers: string;
  activation: string;
  learningRate: number;
  epochs: number;
}
interface Inputs {
  trainingData: Properties[];
  features: string[];
  target: string;
}
interface Outputs {
  model: Properties;
  loss: number[];
  accuracy: number;
  predictions: number[];
}

export const NeuralNetworkNode: NodeDefinition<
  NeuralNetworkInputs,
  NeuralNetworkOutputs,
  NeuralNetworkParams
> = {
  type: 'Algorithmic::NeuralNetwork',
  category: 'Algorithmic',
  subcategory: 'MachineLearning',

  metadata: {
    label: 'NeuralNetwork',
    description: 'Multi-layer perceptron neural network',
  },

  params: {
    hiddenLayers: {
      default: '10,5',
      description: 'Comma-separated layer sizes',
    },
    activation: {
      default: 'relu',
      options: ['relu', 'sigmoid', 'tanh'],
    },
    learningRate: {
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    epochs: {
      default: 100,
      min: 10,
      max: 1000,
    },
  },

  inputs: {
    trainingData: 'Properties[]',
    features: 'string[]',
    target: 'string',
  },

  outputs: {
    model: 'Properties',
    loss: 'number[]',
    accuracy: 'number',
    predictions: 'number[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'neuralNetwork',
      params: {
        trainingData: inputs.trainingData,
        features: inputs.features,
        target: inputs.target,
        hiddenLayers: params.hiddenLayers,
        activation: params.activation,
        learningRate: params.learningRate,
        epochs: params.epochs,
      },
    });

    return {
      model: result,
      loss: result,
      accuracy: result,
      predictions: result,
    };
  },
};
