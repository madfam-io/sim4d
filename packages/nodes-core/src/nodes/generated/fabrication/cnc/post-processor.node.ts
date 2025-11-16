import type { NodeDefinition } from '@brepflow/types';

interface PostProcessorParams {
  machine: string;
  axes: string;
}

interface PostProcessorInputs {
  toolpaths: unknown;
}

interface PostProcessorOutputs {
  ncCode: unknown;
}

export const FabricationCNCPostProcessorNode: NodeDefinition<
  PostProcessorInputs,
  PostProcessorOutputs,
  PostProcessorParams
> = {
  id: 'Fabrication::PostProcessor',
  category: 'Fabrication',
  label: 'PostProcessor',
  description: 'CNC post-processor',
  inputs: {
    toolpaths: {
      type: 'Wire[]',
      label: 'Toolpaths',
      required: true,
    },
  },
  outputs: {
    ncCode: {
      type: 'Data',
      label: 'Nc Code',
    },
  },
  params: {
    machine: {
      type: 'enum',
      label: 'Machine',
      default: 'haas',
      options: ['haas', 'fanuc', 'siemens', 'heidenhain', 'mazak'],
    },
    axes: {
      type: 'enum',
      label: 'Axes',
      default: '3-axis',
      options: ['3-axis', '4-axis', '5-axis'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'postProcessor',
      params: {
        toolpaths: inputs.toolpaths,
        machine: params.machine,
        axes: params.axes,
      },
    });

    return {
      ncCode: result,
    };
  },
};
