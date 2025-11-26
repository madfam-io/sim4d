import type { NodeDefinition } from '@sim4d/types';

interface SlackNotificationParams {
  webhookUrl: string;
  channel: string;
  username: string;
}

interface SlackNotificationInputs {
  message: unknown;
  attachments?: unknown;
}

interface SlackNotificationOutputs {
  sent: unknown;
  timestamp: unknown;
}

export const InteroperabilityMessagingSlackNotificationNode: NodeDefinition<
  SlackNotificationInputs,
  SlackNotificationOutputs,
  SlackNotificationParams
> = {
  id: 'Interoperability::SlackNotification',
  category: 'Interoperability',
  label: 'SlackNotification',
  description: 'Send Slack notifications',
  inputs: {
    message: {
      type: 'string',
      label: 'Message',
      required: true,
    },
    attachments: {
      type: 'Properties[]',
      label: 'Attachments',
      optional: true,
    },
  },
  outputs: {
    sent: {
      type: 'boolean',
      label: 'Sent',
    },
    timestamp: {
      type: 'string',
      label: 'Timestamp',
    },
  },
  params: {
    webhookUrl: {
      type: 'string',
      label: 'Webhook Url',
      default: '',
    },
    channel: {
      type: 'string',
      label: 'Channel',
      default: '#general',
    },
    username: {
      type: 'string',
      label: 'Username',
      default: 'Sim4D',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'slackNotification',
      params: {
        message: inputs.message,
        attachments: inputs.attachments,
        webhookUrl: params.webhookUrl,
        channel: params.channel,
        username: params.username,
      },
    });

    return {
      sent: results.sent,
      timestamp: results.timestamp,
    };
  },
};
