import { describe, it, expect } from 'vitest';
import { FieldSampleFieldLineNode } from './field-line.node';
import { createTestContext } from '../test-utils';

describe('FieldSampleFieldLineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      field: undefined,
      seeds: undefined,
    } as any;
    const params = {
      stepSize: 1,
      maxSteps: 1000,
      direction: 'forward',
    } as any;

    const result = await FieldSampleFieldLineNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
