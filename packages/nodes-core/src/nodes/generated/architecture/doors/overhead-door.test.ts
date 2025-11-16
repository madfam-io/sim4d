import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsOverheadDoorNode } from './overhead-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsOverheadDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      sections: 4,
      trackType: 'standard',
    } as any;

    const result = await ArchitectureDoorsOverheadDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
