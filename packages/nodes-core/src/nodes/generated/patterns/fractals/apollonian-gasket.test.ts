import { describe, it, expect } from 'vitest';
import { PatternsFractalsApollonianGasketNode } from './apollonian-gasket.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsApollonianGasketNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      outerCircle: undefined,
    } as any;
    const params = {
      depth: 5,
      minRadius: 0.1,
    } as any;

    const result = await PatternsFractalsApollonianGasketNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
