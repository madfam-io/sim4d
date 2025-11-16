import { describe, it, expect } from 'vitest';
import { PatternsFractalsBarnsleyFernNode } from './barnsley-fern.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsBarnsleyFernNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      points: 10000,
      variation: 'classic',
    } as any;

    const result = await PatternsFractalsBarnsleyFernNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
