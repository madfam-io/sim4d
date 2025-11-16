import { describe, it, expect } from 'vitest';
import { InteroperabilityIntegrationGrasshopperExportNode } from './grasshopper-export.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityIntegrationGrasshopperExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      definition: undefined,
      filePath: undefined,
    } as any;
    const params = {
      version: 'GH1',
      embedGeometry: true,
    } as any;

    const result = await InteroperabilityIntegrationGrasshopperExportNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
