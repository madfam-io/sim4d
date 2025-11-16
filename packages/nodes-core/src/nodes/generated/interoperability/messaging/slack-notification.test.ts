import { describe, it, expect } from 'vitest';
import { InteroperabilityMessagingSlackNotificationNode } from './slack-notification.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityMessagingSlackNotificationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      message: undefined,
    } as any;
    const params = {
      webhookUrl: '',
      channel: '#general',
      username: 'BrepFlow',
    } as any;

    const result = await InteroperabilityMessagingSlackNotificationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
