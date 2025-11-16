import { describe, it, expect } from 'vitest';
import { ChainDriveNode } from './chaindrive.node';
import { createTestContext } from './../../test-utils';

describe('ChainDriveNode', () => {
  it('should create ChainDrive', async () => {
    const context = createTestContext();
    const inputs = {
      sprocket1Center: null,
      sprocket2Center: null,
    };
    const params = {
      driveTeeth: 17,
      drivenTeeth: 42,
      chainPitch: 12.7,
      chainRows: 1,
    };

    const result = await ChainDriveNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.system).toBeDefined();
    expect(result.sprockets).toBeDefined();
    expect(result.chain).toBeDefined();
  });
});
