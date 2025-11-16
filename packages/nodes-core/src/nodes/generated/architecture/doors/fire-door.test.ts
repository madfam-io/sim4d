import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsFireDoorNode } from './fire-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsFireDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      rating: '60-min',
      closer: true,
      panic: true,
    } as any;

    const result = await ArchitectureDoorsFireDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
