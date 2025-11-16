import { describe, it, expect } from 'vitest';
import { PulleySystemNode } from './pulleysystem.node';
import { createTestContext } from './../../test-utils';

describe('PulleySystemNode', () => {
  it('should create PulleySystem', async () => {
    const context = createTestContext();
    const inputs = {
      driveCenter: null,
      drivenCenter: null,
    };
    const params = {
      driveDiameter: 100,
      drivenDiameter: 200,
      beltWidth: 20,
      centerDistance: 300,
    };

    const result = await PulleySystemNode.evaluate(context, inputs, params);

    expect(result).toBeDefined();
    expect(result.system).toBeDefined();
    expect(result.pulleys).toBeDefined();
    expect(result.belt).toBeDefined();
  });
});
