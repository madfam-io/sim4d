import { describe, it, expect } from 'vitest';
import { FieldSampleSampleFieldNode } from './sample-field.node';
import { createTestContext } from '../test-utils';

describe('FieldSampleSampleFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
      points: undefined,
    } as any;
    const params = {} as any;

    const result = await FieldSampleSampleFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
