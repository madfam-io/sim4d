import { describe, it, expect } from 'vitest';
import { IODrawingExportSVGNode } from './export-svg.node';
import { createTestContext } from '../test-utils';

describe('IODrawingExportSVGNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
    } as any;
    const params = {
      projection: 'top',
      width: 800,
      height: 600,
      strokeWidth: 1,
      fillOpacity: 0.3,
    } as any;

    const result = await IODrawingExportSVGNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
