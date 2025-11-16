import { describe, it, expect } from 'vitest';
import { FabricationLaserLeadInOutNode } from './lead-in-out.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserLeadInOutNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      paths: undefined,
    } as any;
    const params = {
      leadLength: 2,
      leadType: 'line',
    } as any;

    const result = await FabricationLaserLeadInOutNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
