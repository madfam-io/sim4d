import { describe, it, expect } from 'vitest';
import { AnalysisProximityProximityAnalysisNode } from './proximity-analysis.node';
import { createTestContext } from '../test-utils';

describe('AnalysisProximityProximityAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      objects: undefined,
    } as any;
    const params = {
      threshold: 1,
      showConnections: true,
    } as any;

    const result = await AnalysisProximityProximityAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
