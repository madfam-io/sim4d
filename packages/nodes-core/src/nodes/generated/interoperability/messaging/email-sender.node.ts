import type { NodeDefinition } from '@sim4d/types';

interface EmailSenderParams {
  smtpServer: string;
  port: number;
  username: string;
  password: string;
}

interface EmailSenderInputs {
  to: unknown;
  subject: unknown;
  body: unknown;
  attachments?: unknown;
}

interface EmailSenderOutputs {
  sent: unknown;
  messageId: unknown;
}

export const InteroperabilityMessagingEmailSenderNode: NodeDefinition<
  EmailSenderInputs,
  EmailSenderOutputs,
  EmailSenderParams
> = {
  id: 'Interoperability::EmailSender',
  category: 'Interoperability',
  label: 'EmailSender',
  description: 'Send email notifications',
  inputs: {
    to: {
      type: 'string',
      label: 'To',
      required: true,
    },
    subject: {
      type: 'string',
      label: 'Subject',
      required: true,
    },
    body: {
      type: 'string',
      label: 'Body',
      required: true,
    },
    attachments: {
      type: 'string[]',
      label: 'Attachments',
      optional: true,
    },
  },
  outputs: {
    sent: {
      type: 'boolean',
      label: 'Sent',
    },
    messageId: {
      type: 'string',
      label: 'Message Id',
    },
  },
  params: {
    smtpServer: {
      type: 'string',
      label: 'Smtp Server',
      default: '',
    },
    port: {
      type: 'number',
      label: 'Port',
      default: 587,
      min: 1,
      max: 65535,
    },
    username: {
      type: 'string',
      label: 'Username',
      default: '',
    },
    password: {
      type: 'string',
      label: 'Password',
      default: '',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'emailSender',
      params: {
        to: inputs.to,
        subject: inputs.subject,
        body: inputs.body,
        attachments: inputs.attachments,
        smtpServer: params.smtpServer,
        port: params.port,
        username: params.username,
        password: params.password,
      },
    });

    return {
      sent: results.sent,
      messageId: results.messageId,
    };
  },
};
