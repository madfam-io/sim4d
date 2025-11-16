import { describe, it, expect } from 'vitest';
import { TransformPatternsCircularPatternNode } from './circular-pattern.node';
import { createTestContext } from '../test-utils';

describe('TransformPatternsCircularPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      count: 6,
      angle: 360,
      center: [0, 0, 0],
      axis: [0, 0, 1],
      rotateInstances: true,
    } as any;

    const result = await TransformPatternsCircularPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
