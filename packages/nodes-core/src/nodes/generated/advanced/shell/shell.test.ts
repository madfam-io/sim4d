import { describe, it, expect } from 'vitest';
import { AdvancedShellShellNode } from './shell.node';
import { createTestContext } from '../test-utils';

describe('AdvancedShellShellNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      facesToRemove: undefined,
    } as any;
    const params = {
      thickness: 2,
      direction: 'inward',
      tolerance: 0.01,
    } as any;

    const result = await AdvancedShellShellNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
