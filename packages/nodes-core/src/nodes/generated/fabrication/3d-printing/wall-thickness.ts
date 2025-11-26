import type { NodeDefinition } from '@sim4d/types';

interface WallThicknessParams {
  minThickness: number;
  maxThickness: number;
}

interface WallThicknessInputs {
  model: unknown;
}

interface WallThicknessOutputs {
  analysis: unknown;
  thinAreas: unknown;
}

export const Fabrication3DPrintingWallThicknessNode: NodeDefinition<
  WallThicknessInputs,
  WallThicknessOutputs,
  WallThicknessParams
> = {
  id: 'Fabrication::WallThickness',
  type: 'Fabrication::WallThickness',
  category: 'Fabrication',
  label: 'WallThickness',
  description: 'Analyze wall thickness',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    analysis: {
      type: 'Data',
      label: 'Analysis',
    },
    thinAreas: {
      type: 'Face[]',
      label: 'Thin Areas',
    },
  },
  params: {
    minThickness: {
      type: 'number',
      label: 'Min Thickness',
      default: 1,
      min: 0.1,
    },
    maxThickness: {
      type: 'number',
      label: 'Max Thickness',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'wallThickness',
      params: {
        model: inputs.model,
        minThickness: params.minThickness,
        maxThickness: params.maxThickness,
      },
    });

    return {
      analysis: results.analysis,
      thinAreas: results.thinAreas,
    };
  },
};
