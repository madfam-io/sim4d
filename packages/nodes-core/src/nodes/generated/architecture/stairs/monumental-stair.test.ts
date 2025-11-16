import { describe, it, expect } from 'vitest';
import { ArchitectureStairsMonumentalStairNode } from './monumental-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsMonumentalStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      footprint: undefined,
    } as any;
    const params = {
      style: 'imperial',
      width: 3000,
    } as any;

    const result = await ArchitectureStairsMonumentalStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
