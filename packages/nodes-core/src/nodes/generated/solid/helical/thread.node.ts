import type { NodeDefinition } from '@brepflow/types';

interface ThreadParams {
  majorRadius: number;
  pitch: number;
  height: number;
  threadAngle: number;
  internal: boolean;
}

type ThreadInputs = Record<string, never>;

interface ThreadOutputs {
  thread: unknown;
}

export const SolidHelicalThreadNode: NodeDefinition<ThreadInputs, ThreadOutputs, ThreadParams> = {
  id: 'Solid::Thread',
  category: 'Solid',
  label: 'Thread',
  description: 'Create threaded geometry',
  inputs: {},
  outputs: {
    thread: {
      type: 'Solid',
      label: 'Thread',
    },
  },
  params: {
    majorRadius: {
      type: 'number',
      label: 'Major Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 5,
      min: 0.1,
      max: 100,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    threadAngle: {
      type: 'number',
      label: 'Thread Angle',
      default: 60,
      min: 30,
      max: 90,
    },
    internal: {
      type: 'boolean',
      label: 'Internal',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeThread',
      params: {
        majorRadius: params.majorRadius,
        pitch: params.pitch,
        height: params.height,
        threadAngle: params.threadAngle,
        internal: params.internal,
      },
    });

    return {
      thread: result,
    };
  },
};
