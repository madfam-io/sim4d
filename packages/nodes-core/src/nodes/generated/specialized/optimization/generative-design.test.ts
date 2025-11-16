import { describe, it, expect } from 'vitest';
import { SpecializedOptimizationGenerativeDesignNode } from './generative-design.node';
import { createTestContext } from '../test-utils';

describe('SpecializedOptimizationGenerativeDesignNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      designSpace: undefined,
      requirements: undefined,
    } as any;
    const params = {
      objectives: ['weight', 'strength'],
      generations: 20,
      populationSize: 50,
    } as any;

    const result = await SpecializedOptimizationGenerativeDesignNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
