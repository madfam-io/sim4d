import type { NodeDefinition } from '@brepflow/types';

interface CoolingAnalysisParams {
  fanSpeed: number;
  layerTime: number;
}

interface CoolingAnalysisInputs {
  slices: unknown;
}

interface CoolingAnalysisOutputs {
  coolingZones: unknown;
  fanProfile: unknown;
}

export const Fabrication3DPrintingCoolingAnalysisNode: NodeDefinition<
  CoolingAnalysisInputs,
  CoolingAnalysisOutputs,
  CoolingAnalysisParams
> = {
  id: 'Fabrication::CoolingAnalysis',
  type: 'Fabrication::CoolingAnalysis',
  category: 'Fabrication',
  label: 'CoolingAnalysis',
  description: 'Analyze cooling requirements',
  inputs: {
    slices: {
      type: 'Wire[]',
      label: 'Slices',
      required: true,
    },
  },
  outputs: {
    coolingZones: {
      type: 'Wire[]',
      label: 'Cooling Zones',
    },
    fanProfile: {
      type: 'Data',
      label: 'Fan Profile',
    },
  },
  params: {
    fanSpeed: {
      type: 'number',
      label: 'Fan Speed',
      default: 100,
      min: 0,
      max: 100,
    },
    layerTime: {
      type: 'number',
      label: 'Layer Time',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'coolingAnalysis',
      params: {
        slices: inputs.slices,
        fanSpeed: params.fanSpeed,
        layerTime: params.layerTime,
      },
    });

    return {
      coolingZones: results.coolingZones,
      fanProfile: results.fanProfile,
    };
  },
};
