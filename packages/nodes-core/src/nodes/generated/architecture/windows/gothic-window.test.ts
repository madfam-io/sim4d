import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsGothicWindowNode } from './gothic-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsGothicWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      style: 'equilateral',
      tracery: true,
    } as any;

    const result = await ArchitectureWindowsGothicWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
