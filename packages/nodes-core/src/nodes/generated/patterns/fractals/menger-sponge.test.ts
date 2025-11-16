import { describe, it, expect } from 'vitest';
import { PatternsFractalsMengerSpongeNode } from './menger-sponge.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsMengerSpongeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cube: undefined,
    } as any;
    const params = {
      iterations: 3,
    } as any;

    const result = await PatternsFractalsMengerSpongeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
