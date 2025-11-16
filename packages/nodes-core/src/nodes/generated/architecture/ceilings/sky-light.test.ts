import { describe, it, expect } from 'vitest';
import { ArchitectureCeilingsSkyLightNode } from './sky-light.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureCeilingsSkyLightNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      type: 'pyramid',
      glazingType: 'double',
    } as any;

    const result = await ArchitectureCeilingsSkyLightNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
