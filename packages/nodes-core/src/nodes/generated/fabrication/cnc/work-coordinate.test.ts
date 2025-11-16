import { describe, it, expect } from 'vitest';
import { FabricationCNCWorkCoordinateNode } from './work-coordinate.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCWorkCoordinateNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      origin: undefined,
    } as any;
    const params = {
      wcs: 'G54',
    } as any;

    const result = await FabricationCNCWorkCoordinateNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
