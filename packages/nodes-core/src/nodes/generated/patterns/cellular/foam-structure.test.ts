import { describe, it, expect } from 'vitest';
import { PatternsCellularFoamStructureNode } from './foam-structure.node';
import { createTestContext } from '../test-utils';

describe('PatternsCellularFoamStructureNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      container: undefined,
    } as any;
    const params = {
      bubbleCount: 50,
      sizeVariation: 0.5,
    } as any;

    const result = await PatternsCellularFoamStructureNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
