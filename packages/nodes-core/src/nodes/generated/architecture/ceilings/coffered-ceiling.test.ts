import { describe, it, expect } from 'vitest';
import { ArchitectureCeilingsCofferedCeilingNode } from './coffered-ceiling.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureCeilingsCofferedCeilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      ceilingBoundary: undefined,
    } as any;
    const params = {
      cofferSize: 1200,
      cofferDepth: 150,
      beamWidth: 200,
    } as any;

    const result = await ArchitectureCeilingsCofferedCeilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
