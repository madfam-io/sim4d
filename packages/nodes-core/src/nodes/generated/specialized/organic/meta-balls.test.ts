import { describe, it, expect } from 'vitest';
import { SpecializedOrganicMetaBallsNode } from './meta-balls.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOrganicMetaBallsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      centers: undefined,
      radii: undefined,
    } as any;
    const params = {
      threshold: 1,
      resolution: 50,
    } as any;

    const result = await SpecializedOrganicMetaBallsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
