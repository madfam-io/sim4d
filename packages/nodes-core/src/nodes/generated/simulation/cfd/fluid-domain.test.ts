import { describe, it, expect } from 'vitest';
import { SimulationCFDFluidDomainNode } from './fluid-domain.node';
import { createTestContext } from '../test-utils';

describe('SimulationCFDFluidDomainNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      geometry: undefined,
    } as any;
    const params = {
      domainType: 'external',
      boundingBoxScale: [3, 3, 3],
      refinementDistance: 10,
    } as any;

    const result = await SimulationCFDFluidDomainNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
