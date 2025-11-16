import { describe, it, expect } from 'vitest';
import { SimulationCFDFluidPropertiesNode } from './fluid-properties.node';
import { createTestContext } from '../test-utils';

describe('SimulationCFDFluidPropertiesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      domain: undefined,
    } as any;
    const params = {
      fluid: 'air',
      density: 1.225,
      viscosity: 0.0000181,
      compressible: false,
    } as any;

    const result = await SimulationCFDFluidPropertiesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
