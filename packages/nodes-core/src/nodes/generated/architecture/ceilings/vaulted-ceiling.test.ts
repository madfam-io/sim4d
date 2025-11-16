import { describe, it, expect } from 'vitest';
import { ArchitectureCeilingsVaultedCeilingNode } from './vaulted-ceiling.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureCeilingsVaultedCeilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      ceilingOutline: undefined,
    } as any;
    const params = {
      vaultType: 'barrel',
      rise: 1000,
    } as any;

    const result = await ArchitectureCeilingsVaultedCeilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
