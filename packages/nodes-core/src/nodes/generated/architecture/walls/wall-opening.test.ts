import { describe, it, expect } from 'vitest';
import { ArchitectureWallsWallOpeningNode } from './wall-opening.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsWallOpeningNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wall: undefined,
      position: undefined,
    } as any;
    const params = {
      width: 900,
      height: 2100,
      sillHeight: 0,
    } as any;

    const result = await ArchitectureWallsWallOpeningNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
