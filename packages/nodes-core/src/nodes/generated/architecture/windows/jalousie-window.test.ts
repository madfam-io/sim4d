import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsJalousieWindowNode } from './jalousie-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsJalousieWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      slats: 10,
      angle: 0,
    } as any;

    const result = await ArchitectureWindowsJalousieWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
