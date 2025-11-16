import { describe, it, expect } from 'vitest';
import { AssemblyMatesPointToPointNode } from './point-to-point.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesPointToPointNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      point1: undefined,
      point2: undefined,
    } as any;
    const params = {} as any;

    const result = await AssemblyMatesPointToPointNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
