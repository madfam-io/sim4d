import { describe, it, expect } from 'vitest';
import { PatternsCelticCelticKnotNode } from './celtic-knot.node';
import { createTestContext } from '../test-utils';

describe('PatternsCelticCelticKnotNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      path: undefined,
    } as any;
    const params = {
      type: 'trinity',
      width: 2,
    } as any;

    const result = await PatternsCelticCelticKnotNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
