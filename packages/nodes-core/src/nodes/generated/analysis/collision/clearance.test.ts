import { describe, it, expect } from 'vitest';
import { ClearanceNode } from './clearance.node';
import { createTestContext } from './../../test-utils';

describe('ClearanceNode', () => {
  it('should create Clearance', async () => {
    const context = createTestContext();
    const inputs = {
      shape1: null,
      shape2: null,
    };
    const params = {
      minClearance: 1,
    };

    const result = await ClearanceNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.hasClearance).toBeDefined();
    expect(result.actualClearance).toBeDefined();
    expect(result.violationPoints).toBeDefined();
  });
});
