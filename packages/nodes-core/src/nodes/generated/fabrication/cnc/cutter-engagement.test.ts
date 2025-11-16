import { describe, it, expect } from 'vitest';
import { FabricationCNCCutterEngagementNode } from './cutter-engagement.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCCutterEngagementNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpath: undefined,
      stock: undefined,
    } as any;
    const params = {
      toolDiameter: 10,
    } as any;

    const result = await FabricationCNCCutterEngagementNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
