import { describe, it, expect } from 'vitest';
import { AlgorithmicMachineLearningSupportVectorMachineNode } from './support-vector-machine.node';
import { createTestContext } from '../test-utils';

describe('AlgorithmicMachineLearningSupportVectorMachineNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      trainingData: undefined,
      features: undefined,
      target: undefined,
    } as any;
    const params = {
      kernel: 'rbf',
      c: 1,
      gamma: 'scale',
    } as any;

    const result = await AlgorithmicMachineLearningSupportVectorMachineNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
