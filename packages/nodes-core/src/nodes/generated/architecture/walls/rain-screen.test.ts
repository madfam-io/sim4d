import { describe, it, expect } from 'vitest';
import { ArchitectureWallsRainScreenNode } from './rain-screen.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsRainScreenNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wall: undefined,
    } as any;
    const params = {
      claddingType: 'composite',
      ventGap: 25,
    } as any;

    const result = await ArchitectureWallsRainScreenNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
