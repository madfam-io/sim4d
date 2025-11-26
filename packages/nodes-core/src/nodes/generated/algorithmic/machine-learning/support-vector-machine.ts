import type { NodeDefinition } from '@sim4d/types';

interface SupportVectorMachineParams {
  kernel: string;
  c: number;
  gamma: string;
}

interface SupportVectorMachineInputs {
  trainingData: unknown;
  features: unknown;
  target: unknown;
}

interface SupportVectorMachineOutputs {
  model: unknown;
  supportVectors: unknown;
  accuracy: unknown;
}

export const AlgorithmicMachineLearningSupportVectorMachineNode: NodeDefinition<
  SupportVectorMachineInputs,
  SupportVectorMachineOutputs,
  SupportVectorMachineParams
> = {
  id: 'Algorithmic::SupportVectorMachine',
  type: 'Algorithmic::SupportVectorMachine',
  category: 'Algorithmic',
  label: 'SupportVectorMachine',
  description: 'Support Vector Machine classifier',
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
    supportVectors: {
      type: 'Properties[]',
      label: 'Support Vectors',
    },
    accuracy: {
      type: 'number',
      label: 'Accuracy',
    },
  },
  params: {
    kernel: {
      type: 'enum',
      label: 'Kernel',
      default: 'rbf',
      options: ['linear', 'rbf', 'poly'],
    },
    c: {
      type: 'number',
      label: 'C',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    gamma: {
      type: 'enum',
      label: 'Gamma',
      default: 'scale',
      options: ['scale', 'auto'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'supportVectorMachine',
      params: {
        trainingData: inputs.trainingData,
        features: inputs.features,
        target: inputs.target,
        kernel: params.kernel,
        c: params.c,
        gamma: params.gamma,
      },
    });

    return {
      model: results.model,
      supportVectors: results.supportVectors,
      accuracy: results.accuracy,
    };
  },
};
