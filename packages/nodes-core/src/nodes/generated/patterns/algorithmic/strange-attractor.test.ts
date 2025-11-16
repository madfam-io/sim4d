import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicStrangeAttractorNode } from './strange-attractor.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicStrangeAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      initial: undefined,
    } as any;
    const params = {
      type: 'lorenz',
      iterations: 10000,
      dt: 0.01,
    } as any;

    const result = await PatternsAlgorithmicStrangeAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
