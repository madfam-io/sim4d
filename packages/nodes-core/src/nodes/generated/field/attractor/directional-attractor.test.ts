import { describe, it, expect } from 'vitest';
import { FieldAttractorDirectionalAttractorNode } from './directional-attractor.node';
import { createTestContext } from '../test-utils';

describe('FieldAttractorDirectionalAttractorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      origin: undefined,
    } as any;
    const params = {
      direction: [1, 0, 0],
      strength: 1,
      spread: 45,
    } as any;

    const result = await FieldAttractorDirectionalAttractorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
