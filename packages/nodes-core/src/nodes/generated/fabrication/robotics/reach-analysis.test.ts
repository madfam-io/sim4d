import { describe, it, expect } from 'vitest';
import { FabricationRoboticsReachAnalysisNode } from './reach-analysis.node';
import { createTestContext } from '../test-utils';

describe('FabricationRoboticsReachAnalysisNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      robotModel: undefined,
      workspace: undefined,
    } as any;
    const params = {
      resolution: 50,
    } as any;

    const result = await FabricationRoboticsReachAnalysisNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
