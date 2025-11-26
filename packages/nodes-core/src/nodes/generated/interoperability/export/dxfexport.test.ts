import { describe, it, expect } from 'vitest';
import { InteroperabilityExportDXFExportNode } from './dxfexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportDXFExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curves: undefined,
      filePath: undefined,
    } as any;
    const params = {
      version: '2000',
      units: 'mm',
      layerName: 'Sim4D',
    } as any;

    const result = await InteroperabilityExportDXFExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
