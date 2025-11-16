import { describe, it, expect } from 'vitest';
import { InteroperabilityStreamingWebSocketClientNode } from './web-socket-client.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityStreamingWebSocketClientNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      url: '',
      reconnect: true,
      heartbeat: 30,
    } as any;

    const result = await InteroperabilityStreamingWebSocketClientNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
