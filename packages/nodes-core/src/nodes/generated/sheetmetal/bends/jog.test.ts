import { describe, it, expect } from 'vitest';
import { SheetMetalBendsJogNode } from './jog.node';
import { createTestContext } from '../test-utils';

describe('SheetMetalBendsJogNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      sheet: undefined,
      jogLine: undefined,
    } as any;
    const params = {
      jogOffset: 10,
      jogAngle: 90,
      bendRadius: 3,
    } as any;

    const result = await SheetMetalBendsJogNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
