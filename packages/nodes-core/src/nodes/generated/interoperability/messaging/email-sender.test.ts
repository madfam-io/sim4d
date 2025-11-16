import { describe, it, expect } from 'vitest';
import { InteroperabilityMessagingEmailSenderNode } from './email-sender.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityMessagingEmailSenderNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      to: undefined,
      subject: undefined,
      body: undefined,
    } as any;
    const params = {
      smtpServer: '',
      port: 587,
      username: '',
      password: '',
    } as any;

    const result = await InteroperabilityMessagingEmailSenderNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
