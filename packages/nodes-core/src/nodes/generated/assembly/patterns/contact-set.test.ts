import { describe, it, expect } from 'vitest';
import { AssemblyPatternsContactSetNode } from './contact-set.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsContactSetNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      faces1: undefined,
      faces2: undefined,
    } as any;
    const params = {
      type: 'no_penetration',
      friction: 0.3,
    } as any;

    const result = await AssemblyPatternsContactSetNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
