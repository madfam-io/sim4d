import { describe, it, expect } from 'vitest';
import { AnalysisProximityClearanceCheckNode } from './clearance-check.node';
import { createTestContext } from '../test-utils';

describe('AnalysisProximityClearanceCheckNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      movingObject: undefined,
      obstacles: undefined,
    } as any;
    const params = {
      requiredClearance: 5,
      highlightViolations: true,
    } as any;

    const result = await AnalysisProximityClearanceCheckNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
