import { describe, it, expect } from 'vitest';
import { MeshRepairFillHolesNode } from './fill-holes.node';
import { createTestContext } from '../test-utils';

describe('MeshRepairFillHolesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
    } as any;
    const params = {
      maxHoleSize: 100,
      fillMethod: 'smooth',
    } as any;

    const result = await MeshRepairFillHolesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
