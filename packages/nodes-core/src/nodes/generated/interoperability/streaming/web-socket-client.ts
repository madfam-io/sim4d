import type { NodeDefinition } from '@sim4d/types';

interface WebSocketClientParams {
  url: string;
  reconnect: boolean;
  heartbeat: number;
}

interface WebSocketClientInputs {
  message?: unknown;
}

interface WebSocketClientOutputs {
  connected: unknown;
  messages: unknown;
  lastMessage: unknown;
}

export const InteroperabilityStreamingWebSocketClientNode: NodeDefinition<
  WebSocketClientInputs,
  WebSocketClientOutputs,
  WebSocketClientParams
> = {
  id: 'Interoperability::WebSocketClient',
  type: 'Interoperability::WebSocketClient',
  category: 'Interoperability',
  label: 'WebSocketClient',
  description: 'Connect to WebSocket data streams',
  inputs: {
    message: {
      type: 'string',
      label: 'Message',
      optional: true,
    },
  },
  outputs: {
    connected: {
      type: 'boolean',
      label: 'Connected',
    },
    messages: {
      type: 'string[]',
      label: 'Messages',
    },
    lastMessage: {
      type: 'string',
      label: 'Last Message',
    },
  },
  params: {
    url: {
      type: 'string',
      label: 'Url',
      default: '',
    },
    reconnect: {
      type: 'boolean',
      label: 'Reconnect',
      default: true,
    },
    heartbeat: {
      type: 'number',
      label: 'Heartbeat',
      default: 30,
      min: 0,
      max: 300,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'webSocketClient',
      params: {
        message: inputs.message,
        url: params.url,
        reconnect: params.reconnect,
        heartbeat: params.heartbeat,
      },
    });

    return {
      connected: results.connected,
      messages: results.messages,
      lastMessage: results.lastMessage,
    };
  },
};
