import { describe, it, expect } from 'vitest';
import { IOCADExportBREPNode } from './export-brep.node';
import { createTestContext } from '../test-utils';

describe('IOCADExportBREPNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      binary: false,
    } as any;

    const result = await IOCADExportBREPNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
