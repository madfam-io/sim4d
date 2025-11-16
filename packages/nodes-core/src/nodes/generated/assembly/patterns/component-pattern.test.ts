import { describe, it, expect } from 'vitest';
import { AssemblyPatternsComponentPatternNode } from './component-pattern.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsComponentPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      component: undefined,
    } as any;
    const params = {
      patternType: 'linear',
      count: 3,
      spacing: 100,
    } as any;

    const result = await AssemblyPatternsComponentPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
