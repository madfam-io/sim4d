import { describe, it, expect } from 'vitest';
import { PatternsDelaunayDelaunay3DNode } from './delaunay3-d.node';
import { createTestContext } from '../test-utils';

describe('PatternsDelaunayDelaunay3DNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
    } as any;
    const params = {} as any;

    const result = await PatternsDelaunayDelaunay3DNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
