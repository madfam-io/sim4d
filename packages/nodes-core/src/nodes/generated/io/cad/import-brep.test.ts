import { describe, it, expect } from 'vitest';
import { IOCADImportBREPNode } from './import-brep.node';
import { createTestContext } from '../test-utils';

describe('IOCADImportBREPNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      fileData: undefined,
    } as any;
    const params = {
      version: 'auto',
    } as any;

    const result = await IOCADImportBREPNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
