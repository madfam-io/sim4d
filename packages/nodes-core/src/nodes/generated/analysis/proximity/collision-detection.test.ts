import { describe, it, expect } from 'vitest';
import { AnalysisProximityCollisionDetectionNode } from './collision-detection.node';
import { createTestContext } from '../test-utils';

describe('AnalysisProximityCollisionDetectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objects: undefined,
    } as any;
    const params = {
      tolerance: 0.01,
      showCollisions: true,
    } as any;

    const result = await AnalysisProximityCollisionDetectionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
