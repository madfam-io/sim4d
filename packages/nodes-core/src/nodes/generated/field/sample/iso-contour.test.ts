import { describe, it, expect } from 'vitest';
import { FieldSampleIsoContourNode } from './iso-contour.node';
import { createTestContext } from '../test-utils';

describe('FieldSampleIsoContourNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
    } as any;
    const params = {
      value: 0.5,
      smooth: true,
    } as any;

    const result = await FieldSampleIsoContourNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
