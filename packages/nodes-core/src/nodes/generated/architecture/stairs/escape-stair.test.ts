import { describe, it, expect } from 'vitest';
import { ArchitectureStairsEscapeStairNode } from './escape-stair.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureStairsEscapeStairNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      stairwell: undefined,
      floors: undefined,
    } as any;
    const params = {
      enclosure: 'enclosed',
      width: 1200,
    } as any;

    const result = await ArchitectureStairsEscapeStairNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
