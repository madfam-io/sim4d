import { describe, it, expect } from 'vitest';
import { IOCADExportSTEPNode } from './export-step.node';
import { createTestContext } from '../test-utils';

describe('IOCADExportSTEPNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      shape: undefined,
    } as any;
    const params = {
      version: 'AP214',
      writeColors: true,
      writeNames: true,
      writeLayers: true,
      units: 'mm',
    } as any;

    const result = await IOCADExportSTEPNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
