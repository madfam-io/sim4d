import { describe, it, expect } from 'vitest';
import { SimulationCFDExportCFDNode } from './export-cfd.node';
import { createTestContext } from '../test-utils';

describe('SimulationCFDExportCFDNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      cfdModel: undefined,
      setupData: undefined,
    } as any;
    const params = {
      format: 'openfoam',
      meshFormat: 'polyhedral',
    } as any;

    const result = await SimulationCFDExportCFDNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
