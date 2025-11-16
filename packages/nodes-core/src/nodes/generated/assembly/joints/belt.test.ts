import { describe, it, expect } from 'vitest';
import { AssemblyJointsBeltNode } from './belt.node';
import { createTestContext } from '../test-utils';

describe('AssemblyJointsBeltNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      pulley1: undefined,
      pulley2: undefined,
    } as any;
    const params = {
      ratio: 1,
    } as any;

    const result = await AssemblyJointsBeltNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
