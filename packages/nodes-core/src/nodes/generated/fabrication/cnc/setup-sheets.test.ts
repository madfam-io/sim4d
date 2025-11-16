import { describe, it, expect } from 'vitest';
import { FabricationCNCSetupSheetsNode } from './setup-sheets.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCSetupSheetsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      operations: undefined,
    } as any;
    const params = {
      includeToolList: true,
      includeFixtures: true,
    } as any;

    const result = await FabricationCNCSetupSheetsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
