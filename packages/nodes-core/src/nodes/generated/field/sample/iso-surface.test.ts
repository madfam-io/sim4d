import { describe, it, expect } from 'vitest';
import { FieldSampleIsoSurfaceNode } from './iso-surface.node';
import { createTestContext } from '../test-utils';

describe('FieldSampleIsoSurfaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {
      value: 0.5,
      resolution: 50,
    } as any;

    const result = await FieldSampleIsoSurfaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
