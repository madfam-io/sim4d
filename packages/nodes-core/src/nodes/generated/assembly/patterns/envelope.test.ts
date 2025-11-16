import { describe, it, expect } from 'vitest';
import { AssemblyPatternsEnvelopeNode } from './envelope.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsEnvelopeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
    } as any;
    const params = {
      type: 'bounding',
    } as any;

    const result = await AssemblyPatternsEnvelopeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
