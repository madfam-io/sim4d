import { describe, it, expect } from 'vitest';
import { FieldGenerateImageFieldNode } from './image-field.node';
import { createTestContext } from '../test-utils';

describe('FieldGenerateImageFieldNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      image: undefined,
    } as any;
    const params = {
      channel: 'luminance',
      scale: [100, 100],
      height: 10,
    } as any;

    const result = await FieldGenerateImageFieldNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
