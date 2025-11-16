import { describe, it, expect } from 'vitest';
import { FabricationCNCToolLibraryNode } from './tool-library.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCToolLibraryNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      toolNumber: 1,
      toolType: 'endmill',
    } as any;

    const result = await FabricationCNCToolLibraryNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
