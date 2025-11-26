import type { NodeDefinition } from '@sim4d/types';

interface ToolCompensationParams {
  toolRadius: number;
  wearOffset: number;
}

interface ToolCompensationInputs {
  path: unknown;
}

interface ToolCompensationOutputs {
  compensatedPath: unknown;
}

export const FabricationCNCToolCompensationNode: NodeDefinition<
  ToolCompensationInputs,
  ToolCompensationOutputs,
  ToolCompensationParams
> = {
  id: 'Fabrication::ToolCompensation',
  category: 'Fabrication',
  label: 'ToolCompensation',
  description: 'Tool radius compensation',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    compensatedPath: {
      type: 'Wire',
      label: 'Compensated Path',
    },
  },
  params: {
    toolRadius: {
      type: 'number',
      label: 'Tool Radius',
      default: 3,
      min: 0.1,
      max: 25,
    },
    wearOffset: {
      type: 'number',
      label: 'Wear Offset',
      default: 0,
      min: -1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'toolCompensation',
      params: {
        path: inputs.path,
        toolRadius: params.toolRadius,
        wearOffset: params.wearOffset,
      },
    });

    return {
      compensatedPath: result,
    };
  },
};
