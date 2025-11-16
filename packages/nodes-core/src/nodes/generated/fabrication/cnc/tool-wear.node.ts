import type { NodeDefinition } from '@brepflow/types';

interface ToolWearParams {
  material: string;
  cuttingTime: number;
}

interface ToolWearInputs {
  toolpath: unknown;
}

interface ToolWearOutputs {
  wearRate: number;
  toolLife: number;
}

export const FabricationCNCToolWearNode: NodeDefinition<
  ToolWearInputs,
  ToolWearOutputs,
  ToolWearParams
> = {
  id: 'Fabrication::ToolWear',
  category: 'Fabrication',
  label: 'ToolWear',
  description: 'Predict tool wear',
  inputs: {
    toolpath: {
      type: 'Wire[]',
      label: 'Toolpath',
      required: true,
    },
  },
  outputs: {
    wearRate: {
      type: 'Number',
      label: 'Wear Rate',
    },
    toolLife: {
      type: 'Number',
      label: 'Tool Life',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'steel',
      options: ['aluminum', 'steel', 'titanium', 'inconel'],
    },
    cuttingTime: {
      type: 'number',
      label: 'Cutting Time',
      default: 60,
      min: 1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'toolWear',
      params: {
        toolpath: inputs.toolpath,
        material: params.material,
        cuttingTime: params.cuttingTime,
      },
    });

    return {
      wearRate: results.wearRate,
      toolLife: results.toolLife,
    };
  },
};
