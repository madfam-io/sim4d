import { describe, it, expect } from 'vitest';
import { InteroperabilityExportSVGExportNode } from './svgexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportSVGExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      curves: undefined,
      filePath: undefined,
    } as any;
    const params = {
      scale: 1,
      strokeWidth: 1,
      viewBox: true,
    } as any;

    const result = await InteroperabilityExportSVGExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
