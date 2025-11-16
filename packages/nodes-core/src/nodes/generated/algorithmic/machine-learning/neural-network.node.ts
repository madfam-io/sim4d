import type { NodeDefinition } from '@brepflow/types';

interface NeuralNetworkParams {
  hiddenLayers: string;
  activation: string;
  learningRate: number;
  epochs: number;
}

interface NeuralNetworkInputs {
  trainingData: unknown;
  features: unknown;
  target: unknown;
}

interface NeuralNetworkOutputs {
  model: unknown;
  loss: unknown;
  accuracy: unknown;
  predictions: unknown;
}

export const AlgorithmicMachineLearningNeuralNetworkNode: NodeDefinition<
  NeuralNetworkInputs,
  NeuralNetworkOutputs,
  NeuralNetworkParams
> = {
  id: 'Algorithmic::NeuralNetwork',
  category: 'Algorithmic',
  label: 'NeuralNetwork',
  description: 'Multi-layer perceptron neural network',
  inputs: {
    trainingData: {
      type: 'Properties[]',
      label: 'Training Data',
      required: true,
    },
    features: {
      type: 'string[]',
      label: 'Features',
      required: true,
    },
    target: {
      type: 'string',
      label: 'Target',
      required: true,
    },
  },
  outputs: {
    model: {
      type: 'Properties',
      label: 'Model',
    },
    loss: {
      type: 'number[]',
      label: 'Loss',
    },
    accuracy: {
      type: 'number',
      label: 'Accuracy',
    },
    predictions: {
      type: 'number[]',
      label: 'Predictions',
    },
  },
  params: {
    hiddenLayers: {
      type: 'string',
      label: 'Hidden Layers',
      default: '10,5',
    },
    activation: {
      type: 'enum',
      label: 'Activation',
      default: 'relu',
      options: ['relu', 'sigmoid', 'tanh'],
    },
    learningRate: {
      type: 'number',
      label: 'Learning Rate',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    epochs: {
      type: 'number',
      label: 'Epochs',
      default: 100,
      min: 10,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      model: results.model,
      loss: results.loss,
      accuracy: results.accuracy,
      predictions: results.predictions,
    };
  },
};
