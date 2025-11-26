import type { NodeDefinition } from '@sim4d/types';

interface MQTTSubscriberParams {
  broker: string;
  port: number;
  topic: string;
  qos: string;
}

type MQTTSubscriberInputs = Record<string, never>;

interface MQTTSubscriberOutputs {
  connected: unknown;
  messages: unknown;
  lastMessage: unknown;
}

export const InteroperabilityStreamingMQTTSubscriberNode: NodeDefinition<
  MQTTSubscriberInputs,
  MQTTSubscriberOutputs,
  MQTTSubscriberParams
> = {
  id: 'Interoperability::MQTTSubscriber',
  type: 'Interoperability::MQTTSubscriber',
  category: 'Interoperability',
  label: 'MQTTSubscriber',
  description: 'Subscribe to MQTT topics',
  inputs: {},
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
    broker: {
      type: 'string',
      label: 'Broker',
      default: '',
    },
    port: {
      type: 'number',
      label: 'Port',
      default: 1883,
      min: 1,
      max: 65535,
    },
    topic: {
      type: 'string',
      label: 'Topic',
      default: '',
    },
    qos: {
      type: 'enum',
      label: 'Qos',
      default: '0',
      options: ['0', '1', '2'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mqttSubscriber',
      params: {
        broker: params.broker,
        port: params.port,
        topic: params.topic,
        qos: params.qos,
      },
    });

    return {
      connected: results.connected,
      messages: results.messages,
      lastMessage: results.lastMessage,
    };
  },
};
