import type { NodeDefinition } from '@sim4d/types';

interface MQTTPublisherParams {
  broker: string;
  port: number;
  topic: string;
  qos: string;
}

interface MQTTPublisherInputs {
  payload: unknown;
}

interface MQTTPublisherOutputs {
  published: unknown;
  messageId: unknown;
}

export const InteroperabilityStreamingMQTTPublisherNode: NodeDefinition<
  MQTTPublisherInputs,
  MQTTPublisherOutputs,
  MQTTPublisherParams
> = {
  id: 'Interoperability::MQTTPublisher',
  category: 'Interoperability',
  label: 'MQTTPublisher',
  description: 'Publish MQTT messages',
  inputs: {
    payload: {
      type: 'string',
      label: 'Payload',
      required: true,
    },
  },
  outputs: {
    published: {
      type: 'boolean',
      label: 'Published',
    },
    messageId: {
      type: 'string',
      label: 'Message Id',
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
      type: 'mqttPublisher',
      params: {
        payload: inputs.payload,
        broker: params.broker,
        port: params.port,
        topic: params.topic,
        qos: params.qos,
      },
    });

    return {
      published: results.published,
      messageId: results.messageId,
    };
  },
};
