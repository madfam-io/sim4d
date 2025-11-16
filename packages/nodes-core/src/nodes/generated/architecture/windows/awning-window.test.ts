import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsAwningWindowNode } from './awning-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsAwningWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      opening: 0,
    } as any;

    const result = await ArchitectureWindowsAwningWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
