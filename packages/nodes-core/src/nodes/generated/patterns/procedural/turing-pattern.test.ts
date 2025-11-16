import { describe, it, expect } from 'vitest';
import { PatternsProceduralTuringPatternNode } from './turing-pattern.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralTuringPatternNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      domain: undefined,
    } as any;
    const params = {
      model: 'gray-scott',
      iterations: 1000,
      resolution: 100,
    } as any;

    const result = await PatternsProceduralTuringPatternNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
