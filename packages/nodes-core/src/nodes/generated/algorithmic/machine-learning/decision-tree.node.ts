import type { NodeDefinition } from '@sim4d/types';

interface DecisionTreeParams {
  maxDepth: number;
  minSamplesSplit: number;
  criterion: string;
}

interface DecisionTreeInputs {
  trainingData: unknown;
  features: unknown;
  target: unknown;
}

interface DecisionTreeOutputs {
  tree: unknown;
  accuracy: unknown;
  featureImportance: unknown;
}

export const AlgorithmicMachineLearningDecisionTreeNode: NodeDefinition<
  DecisionTreeInputs,
  DecisionTreeOutputs,
  DecisionTreeParams
> = {
  id: 'Algorithmic::DecisionTree',
  category: 'Algorithmic',
  label: 'DecisionTree',
  description: 'Decision tree classifier',
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
    tree: {
      type: 'Properties',
      label: 'Tree',
    },
    accuracy: {
      type: 'number',
      label: 'Accuracy',
    },
    featureImportance: {
      type: 'Properties',
      label: 'Feature Importance',
    },
  },
  params: {
    maxDepth: {
      type: 'number',
      label: 'Max Depth',
      default: 5,
      min: 1,
      max: 20,
    },
    minSamplesSplit: {
      type: 'number',
      label: 'Min Samples Split',
      default: 2,
      min: 2,
      max: 50,
    },
    criterion: {
      type: 'enum',
      label: 'Criterion',
      default: 'gini',
      options: ['gini', 'entropy'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      tree: results.tree,
      accuracy: results.accuracy,
      featureImportance: results.featureImportance,
    };
  },
};
