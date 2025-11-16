import { describe, it, expect } from 'vitest';
import { IODrawingExportDXFNode } from './export-dxf.node';
import { createTestContext } from '../test-utils';

describe('IODrawingExportDXFNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      version: 'R2010',
      projection: 'top',
      hiddenLines: false,
    } as any;

    const result = await IODrawingExportDXFNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
