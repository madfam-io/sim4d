import { describe, it, expect } from 'vitest';
import { ArchitectureWallsTiltUpPanelNode } from './tilt-up-panel.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsTiltUpPanelNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      panelOutline: undefined,
    } as any;
    const params = {
      panelThickness: 200,
      reinforcement: true,
    } as any;

    const result = await ArchitectureWallsTiltUpPanelNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
