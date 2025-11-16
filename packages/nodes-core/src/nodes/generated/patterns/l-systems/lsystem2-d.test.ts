import { describe, it, expect } from 'vitest';
import { PatternsLSystemsLSystem2DNode } from './lsystem2-d.node';
import { createTestContext } from '../test-utils';

describe('PatternsLSystemsLSystem2DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      startPoint: undefined,
    } as any;
    const params = {
      axiom: 'F',
      rules: 'F=F+F-F-F+F',
      angle: 90,
      iterations: 3,
    } as any;

    const result = await PatternsLSystemsLSystem2DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
