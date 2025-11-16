import { describe, it, expect } from 'vitest';
import { SimulationFEAExportFEANode } from './export-fea.node';
import { createTestContext } from '../test-utils';

describe('SimulationFEAExportFEANode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      feaModel: undefined,
    } as any;
    const params = {
      format: 'nastran',
      includeLoads: true,
      includeConstraints: true,
      includeMaterials: true,
    } as any;

    const result = await SimulationFEAExportFEANode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
