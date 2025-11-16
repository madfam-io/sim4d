import { describe, it, expect } from 'vitest';
import { ArchitectureCeilingsStretchCeilingNode } from './stretch-ceiling.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureCeilingsStretchCeilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      ceilingBoundary: undefined,
    } as any;
    const params = {
      fabricType: 'matte',
      backlighting: false,
    } as any;

    const result = await ArchitectureCeilingsStretchCeilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
