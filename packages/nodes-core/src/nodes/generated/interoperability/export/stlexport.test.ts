import { describe, it, expect } from 'vitest';
import { InteroperabilityExportSTLExportNode } from './stlexport.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityExportSTLExportNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shapes: undefined,
      filePath: undefined,
    } as any;
    const params = {
      format: 'binary',
      deflection: 0.1,
      angularDeflection: 0.1,
    } as any;

    const result = await InteroperabilityExportSTLExportNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
