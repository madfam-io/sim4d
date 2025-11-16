import { describe, it, expect } from 'vitest';
import { AssemblyPatternsMotionStudyNode } from './motion-study.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsMotionStudyNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
      drivers: undefined,
    } as any;
    const params = {
      steps: 10,
      duration: 1,
    } as any;

    const result = await AssemblyPatternsMotionStudyNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
