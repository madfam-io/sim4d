import type { NodeDefinition } from '@brepflow/types';

interface LinearRegressionParams {
  regularization: string;
  alpha: number;
  normalize: boolean;
}

interface LinearRegressionInputs {
  trainingData: unknown;
  features: unknown;
  target: unknown;
}

interface LinearRegressionOutputs {
  model: unknown;
  coefficients: unknown;
  rSquared: unknown;
  predictions: unknown;
}

export const AlgorithmicMachineLearningLinearRegressionNode: NodeDefinition<
  LinearRegressionInputs,
  LinearRegressionOutputs,
  LinearRegressionParams
> = {
  id: 'Algorithmic::LinearRegression',
  type: 'Algorithmic::LinearRegression',
  category: 'Algorithmic',
  label: 'LinearRegression',
  description: 'Linear regression analysis',
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
    coefficients: {
      type: 'number[]',
      label: 'Coefficients',
    },
    rSquared: {
      type: 'number',
      label: 'R Squared',
    },
    predictions: {
      type: 'number[]',
      label: 'Predictions',
    },
  },
  params: {
    regularization: {
      type: 'enum',
      label: 'Regularization',
      default: 'none',
      options: ['none', 'ridge', 'lasso'],
    },
    alpha: {
      type: 'number',
      label: 'Alpha',
      default: 1,
      min: 0.001,
      max: 100,
    },
    normalize: {
      type: 'boolean',
      label: 'Normalize',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'linearRegression',
      params: {
        trainingData: inputs.trainingData,
        features: inputs.features,
        target: inputs.target,
        regularization: params.regularization,
        alpha: params.alpha,
        normalize: params.normalize,
      },
    });

    return {
      model: results.model,
      coefficients: results.coefficients,
      rSquared: results.rSquared,
      predictions: results.predictions,
    };
  },
};
