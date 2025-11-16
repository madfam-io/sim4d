import { describe, it, expect } from 'vitest';
import { InteroperabilityAPIJSONGeneratorNode } from './jsongenerator.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityAPIJSONGeneratorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {
      indent: 2,
      compact: false,
    } as any;

    const result = await InteroperabilityAPIJSONGeneratorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
