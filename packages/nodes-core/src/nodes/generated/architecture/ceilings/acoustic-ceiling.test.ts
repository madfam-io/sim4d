import { describe, it, expect } from 'vitest';
import { ArchitectureCeilingsAcousticCeilingNode } from './acoustic-ceiling.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureCeilingsAcousticCeilingNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      ceilingArea: undefined,
    } as any;
    const params = {
      nrc: 0.85,
      panelType: 'tiles',
    } as any;

    const result = await ArchitectureCeilingsAcousticCeilingNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
