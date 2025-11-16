import { describe, it, expect } from 'vitest';
import { AssemblyPatternsConfigurationNode } from './configuration.node';
import { createTestContext } from '../test-utils';

describe('AssemblyPatternsConfigurationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      assembly: undefined,
    } as any;
    const params = {
      name: 'Default',
      suppressedComponents: '',
    } as any;

    const result = await AssemblyPatternsConfigurationNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
