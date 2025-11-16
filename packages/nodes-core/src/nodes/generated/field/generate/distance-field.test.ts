import { describe, it, expect } from 'vitest';
import { FieldGenerateDistanceFieldNode } from './distance-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateDistanceFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      maxDistance: 100,
      inside: false,
      signed: true,
    } as any;

    const result = await FieldGenerateDistanceFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
