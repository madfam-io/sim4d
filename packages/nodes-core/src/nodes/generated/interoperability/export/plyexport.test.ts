import { describe, it, expect } from 'vitest';
import { InteroperabilityExportPLYExportNode } from './plyexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportPLYExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      points: undefined,
      filePath: undefined,
    } as any;
    const params = {
      format: 'binary',
      includeColors: false,
      includeNormals: false,
    } as any;

    const result = await InteroperabilityExportPLYExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
