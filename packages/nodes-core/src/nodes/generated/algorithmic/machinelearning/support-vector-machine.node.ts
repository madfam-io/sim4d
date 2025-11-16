import { NodeDefinition } from '@brepflow/types';

interface Params {
  kernel: string;
  c: number;
  gamma: string;
}
interface Inputs {
  trainingData: Properties[];
  features: string[];
  target: string;
}
interface Outputs {
  model: Properties;
  supportVectors: Properties[];
  accuracy: number;
}

export const SupportVectorMachineNode: NodeDefinition<
  SupportVectorMachineInputs,
  SupportVectorMachineOutputs,
  SupportVectorMachineParams
> = {
  type: 'Algorithmic::SupportVectorMachine',
  category: 'Algorithmic',
  subcategory: 'MachineLearning',

  metadata: {
    label: 'SupportVectorMachine',
    description: 'Support Vector Machine classifier',
  },

  params: {
    kernel: {
      default: 'rbf',
      options: ['linear', 'rbf', 'poly'],
    },
    c: {
      default: 1,
      min: 0.001,
      max: 1000,
    },
    gamma: {
      default: 'scale',
      options: ['scale', 'auto'],
    },
  },

  inputs: {
    trainingData: 'Properties[]',
    features: 'string[]',
    target: 'string',
  },

  outputs: {
    model: 'Properties',
    supportVectors: 'Properties[]',
    accuracy: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      model: result,
      supportVectors: result,
      accuracy: result,
    };
  },
};
