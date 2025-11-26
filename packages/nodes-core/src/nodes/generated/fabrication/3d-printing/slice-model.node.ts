import type { NodeDefinition } from '@sim4d/types';

interface SliceModelParams {
  layerHeight: number;
  infillDensity: number;
  infillPattern: string;
}

interface SliceModelInputs {
  model: unknown;
}

interface SliceModelOutputs {
  slices: unknown;
  infill: unknown;
}

export const Fabrication3DPrintingSliceModelNode: NodeDefinition<
  SliceModelInputs,
  SliceModelOutputs,
  SliceModelParams
> = {
  id: 'Fabrication::SliceModel',
  category: 'Fabrication',
  label: 'SliceModel',
  description: 'Slice model for printing',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    slices: {
      type: 'Wire[]',
      label: 'Slices',
    },
    infill: {
      type: 'Wire[]',
      label: 'Infill',
    },
  },
  params: {
    layerHeight: {
      type: 'number',
      label: 'Layer Height',
      default: 0.2,
      min: 0.05,
      max: 1,
    },
    infillDensity: {
      type: 'number',
      label: 'Infill Density',
      default: 0.2,
      min: 0,
      max: 1,
    },
    infillPattern: {
      type: 'enum',
      label: 'Infill Pattern',
      default: 'grid',
      options: ['grid', 'honeycomb', 'gyroid', 'cubic'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'sliceModel',
      params: {
        model: inputs.model,
        layerHeight: params.layerHeight,
        infillDensity: params.infillDensity,
        infillPattern: params.infillPattern,
      },
    });

    return {
      slices: results.slices,
      infill: results.infill,
    };
  },
};
