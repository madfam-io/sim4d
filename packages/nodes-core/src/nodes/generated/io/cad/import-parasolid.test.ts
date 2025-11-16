import { describe, it, expect } from 'vitest';
import { IOCADImportParasolidNode } from './import-parasolid.node';
import { createTestContext } from '../test-utils';

describe('IOCADImportParasolidNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      healGeometry: true,
      simplifyGeometry: false,
    } as any;

    const result = await IOCADImportParasolidNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
