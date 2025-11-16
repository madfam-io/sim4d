import type { NodeDefinition } from '@brepflow/types';

interface RaftGenerationParams {
  raftLayers: number;
  raftOffset: number;
}

interface RaftGenerationInputs {
  model: unknown;
}

interface RaftGenerationOutputs {
  raft: unknown;
}

export const Fabrication3DPrintingRaftGenerationNode: NodeDefinition<
  RaftGenerationInputs,
  RaftGenerationOutputs,
  RaftGenerationParams
> = {
  id: 'Fabrication::RaftGeneration',
  category: 'Fabrication',
  label: 'RaftGeneration',
  description: 'Generate raft for adhesion',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    raft: {
      type: 'Shape',
      label: 'Raft',
    },
  },
  params: {
    raftLayers: {
      type: 'number',
      label: 'Raft Layers',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    raftOffset: {
      type: 'number',
      label: 'Raft Offset',
      default: 5,
      min: 0,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'raftGeneration',
      params: {
        model: inputs.model,
        raftLayers: params.raftLayers,
        raftOffset: params.raftOffset,
      },
    });

    return {
      raft: result,
    };
  },
};
