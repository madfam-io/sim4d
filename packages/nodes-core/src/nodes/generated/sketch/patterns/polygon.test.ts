import { describe, it, expect } from 'vitest';
import { SketchPatternsPolygonNode } from './polygon.node';
import { createTestContext } from '../test-utils';

describe('SketchPatternsPolygonNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      sides: 6,
      radius: 50,
      inscribed: true,
    } as any;

    const result = await SketchPatternsPolygonNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
