import { NodeDefinition } from '@brepflow/types';

interface Params {
  broker: string;
  port: number;
  topic: string;
  qos: string;
}
interface Inputs {
  payload: string;
}
interface Outputs {
  published: boolean;
  messageId: string;
}

export const MQTTPublisherNode: NodeDefinition<
  MQTTPublisherInputs,
  MQTTPublisherOutputs,
  MQTTPublisherParams
> = {
  type: 'Interoperability::MQTTPublisher',
  category: 'Interoperability',
  subcategory: 'Streaming',

  metadata: {
    label: 'MQTTPublisher',
    description: 'Publish MQTT messages',
  },

  params: {
    broker: {
      default: '',
      description: 'MQTT broker address',
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

  inputs: {
    payload: 'string',
  },

  outputs: {
    published: 'boolean',
    messageId: 'string',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      published: result,
      messageId: result,
    };
  },
};
