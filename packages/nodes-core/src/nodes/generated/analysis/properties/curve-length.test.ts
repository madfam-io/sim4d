import { describe, it, expect } from 'vitest';
import { CurveLengthNode } from './curvelength.node';
import { createTestContext } from './../../test-utils';

describe('CurveLengthNode', () => {
  it('should create CurveLength', async () => {
    const context = createTestContext();
    const inputs = {
      curve: null,
    };
    const params = {};

    const result = await CurveLengthNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.length).toBeDefined();
  });
});
