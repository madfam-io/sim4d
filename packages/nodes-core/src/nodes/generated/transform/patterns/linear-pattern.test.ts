import { describe, it, expect } from 'vitest';
import { TransformPatternsLinearPatternNode } from './linear-pattern.node';
import { createTestContext } from '../test-utils';

describe('TransformPatternsLinearPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      count: 5,
      spacing: 20,
      direction: [1, 0, 0],
      centered: false,
    } as any;

    const result = await TransformPatternsLinearPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
