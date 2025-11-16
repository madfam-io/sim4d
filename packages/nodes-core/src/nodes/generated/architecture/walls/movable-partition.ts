import type { NodeDefinition } from '@brepflow/types';

interface MovablePartitionParams {
  panelWidth: number;
  trackType: string;
}

interface MovablePartitionInputs {
  path: unknown;
}

interface MovablePartitionOutputs {
  partition: unknown;
  track: unknown;
}

export const ArchitectureWallsMovablePartitionNode: NodeDefinition<
  MovablePartitionInputs,
  MovablePartitionOutputs,
  MovablePartitionParams
> = {
  id: 'Architecture::MovablePartition',
  type: 'Architecture::MovablePartition',
  category: 'Architecture',
  label: 'MovablePartition',
  description: 'Movable partition system',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    partition: {
      type: 'Shape[]',
      label: 'Partition',
    },
    track: {
      type: 'Wire',
      label: 'Track',
    },
  },
  params: {
    panelWidth: {
      type: 'number',
      label: 'Panel Width',
      default: 1200,
      min: 600,
      max: 2000,
    },
    trackType: {
      type: 'enum',
      label: 'Track Type',
      default: 'ceiling',
      options: ['ceiling', 'floor', 'both'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'movablePartition',
      params: {
        path: inputs.path,
        panelWidth: params.panelWidth,
        trackType: params.trackType,
      },
    });

    return {
      partition: results.partition,
      track: results.track,
    };
  },
};
