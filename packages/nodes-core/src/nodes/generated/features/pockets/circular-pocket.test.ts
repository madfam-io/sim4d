import { describe, it, expect } from 'vitest';
import { FeaturesPocketsCircularPocketNode } from './circular-pocket.node';
import { createTestContext } from '../test-utils';

describe('FeaturesPocketsCircularPocketNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      face: undefined,
      position: undefined,
    } as any;
    const params = {
      diameter: 40,
      depth: 10,
      draftAngle: 0,
    } as any;

    const result = await FeaturesPocketsCircularPocketNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
