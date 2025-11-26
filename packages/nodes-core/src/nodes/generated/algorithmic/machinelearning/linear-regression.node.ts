import { NodeDefinition } from '@sim4d/types';

interface Params {
  regularization: string;
  alpha: number;
  normalize: boolean;
}
interface Inputs {
  trainingData: Properties[];
  features: string[];
  target: string;
}
interface Outputs {
  model: Properties;
  coefficients: number[];
  rSquared: number;
  predictions: number[];
}

export const LinearRegressionNode: NodeDefinition<
  LinearRegressionInputs,
  LinearRegressionOutputs,
  LinearRegressionParams
> = {
  type: 'Algorithmic::LinearRegression',
  category: 'Algorithmic',
  subcategory: 'MachineLearning',

  metadata: {
    label: 'LinearRegression',
    description: 'Linear regression analysis',
  },

  params: {
    regularization: {
      default: 'none',
      options: ['none', 'ridge', 'lasso'],
    },
    alpha: {
      default: 1,
      min: 0.001,
      max: 100,
    },
    normalize: {
      default: true,
    },
  },

  inputs: {
    trainingData: 'Properties[]',
    features: 'string[]',
    target: 'string',
  },

  outputs: {
    model: 'Properties',
    coefficients: 'number[]',
    rSquared: 'number',
    predictions: 'number[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      model: result,
      coefficients: result,
      rSquared: result,
      predictions: result,
    };
  },
};
