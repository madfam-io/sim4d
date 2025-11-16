import { describe, it, expect } from 'vitest';
import { FabricationCNCHighSpeedMachiningNode } from './high-speed-machining.node';
import { createTestContext } from '../test-utils';

describe('FabricationCNCHighSpeedMachiningNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      toolpath: undefined,
    } as any;
    const params = {
      cornerRadius: 2,
      entrySpeed: 0.5,
    } as any;

    const result = await FabricationCNCHighSpeedMachiningNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
