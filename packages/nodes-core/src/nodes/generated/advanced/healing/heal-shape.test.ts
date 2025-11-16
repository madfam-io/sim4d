import { describe, it, expect } from 'vitest';
import { AdvancedHealingHealShapeNode } from './heal-shape.node';
import { createTestContext } from '../test-utils';

describe('AdvancedHealingHealShapeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      fixSmallEdges: true,
      fixSmallFaces: true,
      sewFaces: true,
      makeManifold: false,
    } as any;

    const result = await AdvancedHealingHealShapeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
