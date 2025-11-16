import { describe, it, expect } from 'vitest';
import { SimulationFEAApplyConstraintsNode } from './apply-constraints.node';
import { createTestContext } from '../test-utils';

describe('SimulationFEAApplyConstraintsNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      mesh: undefined,
      constraintFaces: undefined,
    } as any;
    const params = {
      constraintType: 'fixed',
      dof: [true, true, true, true, true, true],
    } as any;

    const result = await SimulationFEAApplyConstraintsNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
