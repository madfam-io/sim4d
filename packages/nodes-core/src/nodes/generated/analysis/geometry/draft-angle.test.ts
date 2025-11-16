import { describe, it, expect } from 'vitest';
import { DraftAngleNode } from './draftangle.node';
import { createTestContext } from './../../test-utils';

describe('DraftAngleNode', () => {
  it('should create DraftAngle', async () => {
    const context = createTestContext();
    const inputs = {
      solid: null,
    };
    const params = {
      pullDirection: [0, 0, 1],
      minAngle: 1,
      maxAngle: 10,
    };

    const result = await DraftAngleNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.validFaces).toBeDefined();
    expect(result.invalidFaces).toBeDefined();
    expect(result.verticalFaces).toBeDefined();
  });
});
