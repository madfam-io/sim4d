import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsClerestroyWindowNode } from './clerestroy-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsClerestroyWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallTop: undefined,
    } as any;
    const params = {
      height: 600,
      continuous: true,
    } as any;

    const result = await ArchitectureWindowsClerestroyWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
