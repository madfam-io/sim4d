import { NodeDefinition } from '@brepflow/types';

interface Params {
  maxDepth: number;
  minSamplesSplit: number;
  criterion: string;
}
interface Inputs {
  trainingData: Properties[];
  features: string[];
  target: string;
}
interface Outputs {
  tree: Properties;
  accuracy: number;
  featureImportance: Properties;
}

export const DecisionTreeNode: NodeDefinition<
  DecisionTreeInputs,
  DecisionTreeOutputs,
  DecisionTreeParams
> = {
  type: 'Algorithmic::DecisionTree',
  category: 'Algorithmic',
  subcategory: 'MachineLearning',

  metadata: {
    label: 'DecisionTree',
    description: 'Decision tree classifier',
  },

  params: {
    maxDepth: {
      default: 5,
      min: 1,
      max: 20,
    },
    minSamplesSplit: {
      default: 2,
      min: 2,
      max: 50,
    },
    criterion: {
      default: 'gini',
      options: ['gini', 'entropy'],
    },
  },

  inputs: {
    trainingData: 'Properties[]',
    features: 'string[]',
    target: 'string',
  },

  outputs: {
    tree: 'Properties',
    accuracy: 'number',
    featureImportance: 'Properties',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'decisionTree',
      params: {
        trainingData: inputs.trainingData,
        features: inputs.features,
        target: inputs.target,
        maxDepth: params.maxDepth,
        minSamplesSplit: params.minSamplesSplit,
        criterion: params.criterion,
      },
    });

    return {
      tree: result,
      accuracy: result,
      featureImportance: result,
    };
  },
};
