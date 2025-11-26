import type { NodeDefinition } from '@sim4d/types';

interface CutterEngagementParams {
  toolDiameter: number;
}

interface CutterEngagementInputs {
  toolpath: unknown;
  stock: unknown;
}

interface CutterEngagementOutputs {
  engagementAngle: number[];
}

export const FabricationCNCCutterEngagementNode: NodeDefinition<
  CutterEngagementInputs,
  CutterEngagementOutputs,
  CutterEngagementParams
> = {
  id: 'Fabrication::CutterEngagement',
  category: 'Fabrication',
  label: 'CutterEngagement',
  description: 'Analyze cutter engagement',
  inputs: {
    toolpath: {
      type: 'Wire',
      label: 'Toolpath',
      required: true,
    },
    stock: {
      type: 'Shape',
      label: 'Stock',
      required: true,
    },
  },
  outputs: {
    engagementAngle: {
      type: 'Number[]',
      label: 'Engagement Angle',
    },
  },
  params: {
    toolDiameter: {
      type: 'number',
      label: 'Tool Diameter',
      default: 10,
      min: 1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'cutterEngagement',
      params: {
        toolpath: inputs.toolpath,
        stock: inputs.stock,
        toolDiameter: params.toolDiameter,
      },
    });

    return {
      engagementAngle: result,
    };
  },
};
