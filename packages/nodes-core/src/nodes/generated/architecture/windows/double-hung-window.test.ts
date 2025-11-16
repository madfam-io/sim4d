import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsDoubleHungWindowNode } from './double-hung-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsDoubleHungWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      width: 900,
      height: 1500,
      sashPosition: 0.5,
    } as any;

    const result = await ArchitectureWindowsDoubleHungWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
