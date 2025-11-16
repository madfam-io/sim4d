import { describe, it, expect } from 'vitest';
import { IOCADImportSTEPNode } from './import-step.node';
import { createTestContext } from '../test-utils';

describe('IOCADImportSTEPNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      readColors: true,
      readNames: true,
      readLayers: true,
      preferBrep: true,
    } as any;

    const result = await IOCADImportSTEPNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
