import { describe, it, expect } from 'vitest';
import { LinearRegressionNode } from './linearregression.node';
import { createTestContext } from './../../test-utils';

describe('LinearRegressionNode', () => {
  it('should create LinearRegression', async () => {
    const context = createTestContext();
    const inputs = {
      trainingData: null,
      features: null,
      target: null,
    };
    const params = {
      regularization: 'none',
      alpha: 1,
      normalize: true,
    };

    const result = await LinearRegressionNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.model).toBeDefined();
    expect(result.coefficients).toBeDefined();
    expect(result.rSquared).toBeDefined();
    expect(result.predictions).toBeDefined();
  });
});
