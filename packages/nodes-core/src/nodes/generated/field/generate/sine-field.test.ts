import { describe, it, expect } from 'vitest';
import { FieldGenerateSineFieldNode } from './sine-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateSineFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      domain: undefined,
    } as any;
    const params = {
      frequency: [0.1, 0.1, 0.1],
      amplitude: 1,
      phase: [0, 0, 0],
    } as any;

    const result = await FieldGenerateSineFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
