import { describe, it, expect } from 'vitest';
import { SheetMetalFeaturesTabNode } from './tab.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalFeaturesTabNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      edge: undefined,
      position: undefined,
    } as any;
    const params = {
      tabWidth: 20,
      tabDepth: 10,
      tabType: 'rectangular',
      cornerRadius: 2,
    } as any;

    const result = await SheetMetalFeaturesTabNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
