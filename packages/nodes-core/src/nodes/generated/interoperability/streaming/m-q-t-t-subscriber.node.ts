import { NodeDefinition } from '@brepflow/types';

interface Params {
  broker: string;
  port: number;
  topic: string;
  qos: string;
}
type Inputs = {};
interface Outputs {
  connected: boolean;
  messages: string[];
  lastMessage: string;
}

export const MQTTSubscriberNode: NodeDefinition<
  MQTTSubscriberInputs,
  MQTTSubscriberOutputs,
  MQTTSubscriberParams
> = {
  type: 'Interoperability::MQTTSubscriber',
  category: 'Interoperability',
  subcategory: 'Streaming',

  metadata: {
    label: 'MQTTSubscriber',
    description: 'Subscribe to MQTT topics',
  },

  params: {
    broker: {
      default: '',
    },
    port: {
      default: 1883,
      min: 1,
      max: 65535,
    },
    topic: {
      default: '',
    },
    qos: {
      default: '0',
      options: ['0', '1', '2'],
    },
  },

  inputs: {},

  outputs: {
    connected: 'boolean',
    messages: 'string[]',
    lastMessage: 'string',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mqttSubscriber',
      params: {
        broker: params.broker,
        port: params.port,
        topic: params.topic,
        qos: params.qos,
      },
    });

    return {
      connected: result,
      messages: result,
      lastMessage: result,
    };
  },
};
