import { describe, it, expect } from 'vitest';
import { IODrawingImportDXFNode } from './import-dxf.node';
import { createTestContext } from '../test-utils';

describe('IODrawingImportDXFNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      importAs: '2d',
      layerFilter: '*',
      units: 'mm',
    } as any;

    const result = await IODrawingImportDXFNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
