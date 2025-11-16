import { describe, it, expect } from 'vitest';
import { InteroperabilityImportSVGImportNode } from './svgimport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityImportSVGImportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      filePath: undefined,
    } as any;
    const params = {
      scale: 1,
      tolerance: 0.1,
      flatten: true,
    } as any;

    const result = await InteroperabilityImportSVGImportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
