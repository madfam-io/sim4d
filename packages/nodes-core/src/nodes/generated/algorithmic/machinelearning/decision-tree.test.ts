import { describe, it, expect } from 'vitest';
import { DecisionTreeNode } from './decisiontree.node';
import { createTestContext } from './../../test-utils';

describe('DecisionTreeNode', () => {
  it('should create DecisionTree', async () => {
    const context = createTestContext();
    const inputs = {
      trainingData: null,
      features: null,
      target: null,
    };
    const params = {
      maxDepth: 5,
      minSamplesSplit: 2,
      criterion: 'gini',
    };

    const result = await DecisionTreeNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.tree).toBeDefined();
    expect(result.accuracy).toBeDefined();
    expect(result.featureImportance).toBeDefined();
  });
});
