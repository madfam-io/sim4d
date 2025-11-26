import type { NodeDefinition } from '@sim4d/types';

interface ToolLibraryParams {
  toolNumber: number;
  toolType: string;
}

type ToolLibraryInputs = Record<string, never>;

interface ToolLibraryOutputs {
  toolData: unknown;
}

export const FabricationCNCToolLibraryNode: NodeDefinition<
  ToolLibraryInputs,
  ToolLibraryOutputs,
  ToolLibraryParams
> = {
  id: 'Fabrication::ToolLibrary',
  category: 'Fabrication',
  label: 'ToolLibrary',
  description: 'Tool library management',
  inputs: {},
  outputs: {
    toolData: {
      type: 'Data',
      label: 'Tool Data',
    },
  },
  params: {
    toolNumber: {
      type: 'number',
      label: 'Tool Number',
      default: 1,
      min: 1,
      max: 999,
      step: 1,
    },
    toolType: {
      type: 'enum',
      label: 'Tool Type',
      default: 'endmill',
      options: ['endmill', 'ballmill', 'drill', 'tap', 'reamer', 'boring'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'toolLibrary',
      params: {
        toolNumber: params.toolNumber,
        toolType: params.toolType,
      },
    });

    return {
      toolData: result,
    };
  },
};
