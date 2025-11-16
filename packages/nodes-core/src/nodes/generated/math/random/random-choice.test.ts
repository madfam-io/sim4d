import { describe, it, expect } from 'vitest';
import { MathRandomRandomChoiceNode } from './random-choice.node';
import { createTestContext } from '../test-utils';

describe('MathRandomRandomChoiceNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      choices: undefined,
    } as any;
    const params = {
      seed: -1,
    } as any;

    const result = await MathRandomRandomChoiceNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
