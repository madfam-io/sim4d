import { describe, it, expect } from 'vitest';
import { PatternsProceduralNeuralPatternNode } from './neural-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralNeuralPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      inputPoints: undefined,
    } as any;
    const params = {
      neurons: 100,
      connections: 3,
    } as any;

    const result = await PatternsProceduralNeuralPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
