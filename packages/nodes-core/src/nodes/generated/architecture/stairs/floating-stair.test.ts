import { describe, it, expect } from 'vitest';
import { ArchitectureStairsFloatingStairNode } from './floating-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsFloatingStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      wallLine: undefined,
      riseRun: undefined,
    } as any;
    const params = {
      cantileverDepth: 100,
      treadThickness: 60,
    } as any;

    const result = await ArchitectureStairsFloatingStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
