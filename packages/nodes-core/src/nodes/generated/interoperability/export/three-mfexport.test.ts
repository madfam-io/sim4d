import { describe, it, expect } from 'vitest';
import { InteroperabilityExportThreeMFExportNode } from './three-mfexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportThreeMFExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      models: undefined,
      filePath: undefined,
    } as any;
    const params = {
      units: 'mm',
      includeColors: true,
      compression: true,
    } as any;

    const result = await InteroperabilityExportThreeMFExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
