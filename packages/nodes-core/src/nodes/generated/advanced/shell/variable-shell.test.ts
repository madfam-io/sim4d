import { describe, it, expect } from 'vitest';
import { AdvancedShellVariableShellNode } from './variable-shell.node';
import { createTestContext } from '../test-utils';

describe('AdvancedShellVariableShellNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      solid: undefined,
      facesToRemove: undefined,
      thicknessMap: undefined,
    } as any;
    const params = {} as any;

    const result = await AdvancedShellVariableShellNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
