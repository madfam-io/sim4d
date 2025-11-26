import type { NodeDefinition } from '@sim4d/types';

interface ThreadMillingParams {
  threadPitch: number;
  threadDepth: number;
  passes: number;
}

interface ThreadMillingInputs {
  holes: unknown;
}

interface ThreadMillingOutputs {
  threadPaths: unknown;
}

export const FabricationCNCThreadMillingNode: NodeDefinition<
  ThreadMillingInputs,
  ThreadMillingOutputs,
  ThreadMillingParams
> = {
  id: 'Fabrication::ThreadMilling',
  category: 'Fabrication',
  label: 'ThreadMilling',
  description: 'Thread milling operation',
  inputs: {
    holes: {
      type: 'Wire[]',
      label: 'Holes',
      required: true,
    },
  },
  outputs: {
    threadPaths: {
      type: 'Wire[]',
      label: 'Thread Paths',
    },
  },
  params: {
    threadPitch: {
      type: 'number',
      label: 'Thread Pitch',
      default: 1.5,
      min: 0.1,
      max: 10,
    },
    threadDepth: {
      type: 'number',
      label: 'Thread Depth',
      default: 1,
      min: 0.1,
      max: 5,
    },
    passes: {
      type: 'number',
      label: 'Passes',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'threadMilling',
      params: {
        holes: inputs.holes,
        threadPitch: params.threadPitch,
        threadDepth: params.threadDepth,
        passes: params.passes,
      },
    });

    return {
      threadPaths: result,
    };
  },
};
