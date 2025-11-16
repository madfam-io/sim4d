import { describe, it, expect } from 'vitest';
import { ArchitectureDoorsSecurityDoorNode } from './security-door.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureDoorsSecurityDoorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      opening: undefined,
    } as any;
    const params = {
      level: 'high',
      accessControl: 'card',
    } as any;

    const result = await ArchitectureDoorsSecurityDoorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
