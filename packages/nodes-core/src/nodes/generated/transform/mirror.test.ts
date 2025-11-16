import { describe, it, expect } from 'vitest';
import { TransformMirrorNode } from './mirror.node';
import { createTestContext } from '../test-utils';

describe('TransformMirrorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      planeOriginX: 0,
      planeOriginY: 0,
      planeOriginZ: 0,
      planeNormalX: 1,
      planeNormalY: 0,
      planeNormalZ: 0,
      copy: true,
    } as any;

    const result = await TransformMirrorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
