import type { NodeDefinition } from '@brepflow/types';

interface PrintTimeEstimateParams {
  printSpeed: number;
  travelSpeed: number;
  layerHeight: number;
}

interface PrintTimeEstimateInputs {
  model: unknown;
}

interface PrintTimeEstimateOutputs {
  timeHours: number;
  filamentMeters: number;
}

export const Fabrication3DPrintingPrintTimeEstimateNode: NodeDefinition<
  PrintTimeEstimateInputs,
  PrintTimeEstimateOutputs,
  PrintTimeEstimateParams
> = {
  id: 'Fabrication::PrintTimeEstimate',
  type: 'Fabrication::PrintTimeEstimate',
  category: 'Fabrication',
  label: 'PrintTimeEstimate',
  description: 'Estimate print time',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    timeHours: {
      type: 'Number',
      label: 'Time Hours',
    },
    filamentMeters: {
      type: 'Number',
      label: 'Filament Meters',
    },
  },
  params: {
    printSpeed: {
      type: 'number',
      label: 'Print Speed',
      default: 60,
      min: 10,
      max: 300,
    },
    travelSpeed: {
      type: 'number',
      label: 'Travel Speed',
      default: 120,
      min: 50,
      max: 500,
    },
    layerHeight: {
      type: 'number',
      label: 'Layer Height',
      default: 0.2,
      min: 0.05,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'printTimeEstimate',
      params: {
        model: inputs.model,
        printSpeed: params.printSpeed,
        travelSpeed: params.travelSpeed,
        layerHeight: params.layerHeight,
      },
    });

    return {
      timeHours: results.timeHours,
      filamentMeters: results.filamentMeters,
    };
  },
};
