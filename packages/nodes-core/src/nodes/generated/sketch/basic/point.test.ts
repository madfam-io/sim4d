import { describe, it, expect } from 'vitest';
import { SketchBasicPointNode } from './point.node';
import { createTestContext } from '../test-utils';

describe('SketchBasicPointNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      x: 0,
      y: 0,
      z: 0,
    } as any;

    const result = await SketchBasicPointNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
