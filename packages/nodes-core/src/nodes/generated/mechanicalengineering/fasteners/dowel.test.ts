import { describe, it, expect } from 'vitest';
import { MechanicalEngineeringFastenersDowelNode } from './dowel.node';
import { createTestContext } from '../test-utils';

describe('MechanicalEngineeringFastenersDowelNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      position: undefined,
    } as any;
    const params = {
      diameter: 6,
      length: 20,
      tolerance: 'h7',
      chamfered: true,
    } as any;

    const result = await MechanicalEngineeringFastenersDowelNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
