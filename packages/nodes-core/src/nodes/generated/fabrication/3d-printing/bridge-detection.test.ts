import { describe, it, expect } from 'vitest';
import { Fabrication3DPrintingBridgeDetectionNode } from './bridge-detection.node';
import { createTestContext } from '../test-utils';

describe('Fabrication3DPrintingBridgeDetectionNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      model: undefined,
    } as any;
    const params = {
      maxBridge: 5,
      overhangAngle: 45,
    } as any;

    const result = await Fabrication3DPrintingBridgeDetectionNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
