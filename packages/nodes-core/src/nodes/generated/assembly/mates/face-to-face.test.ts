import { describe, it, expect } from 'vitest';
import { AssemblyMatesFaceToFaceNode } from './face-to-face.node';
import { createTestContext } from '../test-utils';

describe('AssemblyMatesFaceToFaceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      face1: undefined,
      face2: undefined,
    } as any;
    const params = {
      offset: 0,
      flip: false,
    } as any;

    const result = await AssemblyMatesFaceToFaceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
