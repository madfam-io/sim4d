import type { NodeDefinition } from '@sim4d/types';

interface SafetyZonesParams {
  margin: number;
}

interface SafetyZonesInputs {
  workArea: unknown;
}

interface SafetyZonesOutputs {
  safeArea: unknown;
  noGoZones: unknown;
}

export const FabricationLaserSafetyZonesNode: NodeDefinition<
  SafetyZonesInputs,
  SafetyZonesOutputs,
  SafetyZonesParams
> = {
  id: 'Fabrication::SafetyZones',
  category: 'Fabrication',
  label: 'SafetyZones',
  description: 'Define safety zones',
  inputs: {
    workArea: {
      type: 'Face',
      label: 'Work Area',
      required: true,
    },
  },
  outputs: {
    safeArea: {
      type: 'Face',
      label: 'Safe Area',
    },
    noGoZones: {
      type: 'Face[]',
      label: 'No Go Zones',
    },
  },
  params: {
    margin: {
      type: 'number',
      label: 'Margin',
      default: 5,
      min: 0,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'safetyZones',
      params: {
        workArea: inputs.workArea,
        margin: params.margin,
      },
    });

    return {
      safeArea: results.safeArea,
      noGoZones: results.noGoZones,
    };
  },
};
