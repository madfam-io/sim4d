import { describe, it, expect } from 'vitest';
import { IOCADExportIGESNode } from './export-iges.node';
import { createTestContext } from '../test-utils';

describe('IOCADExportIGESNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      brepMode: 'faces',
      units: 'mm',
      author: '',
    } as any;

    const result = await IOCADExportIGESNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
