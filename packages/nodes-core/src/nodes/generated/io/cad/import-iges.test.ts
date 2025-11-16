import { describe, it, expect } from 'vitest';
import { IOCADImportIGESNode } from './import-iges.node';
import { createTestContext } from '../test-utils';

describe('IOCADImportIGESNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      readSurfaces: true,
      readCurves: true,
      sequence: true,
    } as any;

    const result = await IOCADImportIGESNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
