import { describe, it, expect } from 'vitest';
import { PatternsProceduralMarkovChainNode } from './markov-chain.node';
import { createTestContext } from '../test-utils';

describe('PatternsProceduralMarkovChainNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      transitionMatrix: undefined,
    } as any;
    const params = {
      states: 5,
      steps: 100,
      seed: 0,
    } as any;

    const result = await PatternsProceduralMarkovChainNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
