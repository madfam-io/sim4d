import { describe, it, expect } from 'vitest';
import { SheetMetalBendsHemNode } from './hem.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalBendsHemNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      edge: undefined,
    } as any;
    const params = {
      hemType: 'closed',
      hemLength: 10,
      hemGap: 0.5,
      hemRadius: 0.5,
    } as any;

    const result = await SheetMetalBendsHemNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
