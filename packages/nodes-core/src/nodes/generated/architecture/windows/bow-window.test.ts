import { describe, it, expect } from 'vitest';
import { ArchitectureWindowsBowWindowNode } from './bow-window.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWindowsBowWindowNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallOpening: undefined,
    } as any;
    const params = {
      projection: 600,
      segments: 5,
    } as any;

    const result = await ArchitectureWindowsBowWindowNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
