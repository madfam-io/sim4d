import type { NodeDefinition } from '@brepflow/types';

interface SafetyZoneSetupParams {
  zoneType: string;
  responseTime: number;
}

interface SafetyZoneSetupInputs {
  zones: unknown;
}

interface SafetyZoneSetupOutputs {
  safetyConfiguration: unknown;
}

export const FabricationRoboticsSafetyZoneSetupNode: NodeDefinition<
  SafetyZoneSetupInputs,
  SafetyZoneSetupOutputs,
  SafetyZoneSetupParams
> = {
  id: 'Fabrication::SafetyZoneSetup',
  type: 'Fabrication::SafetyZoneSetup',
  category: 'Fabrication',
  label: 'SafetyZoneSetup',
  description: 'Define robot safety zones',
  inputs: {
    zones: {
      type: 'Box[]',
      label: 'Zones',
      required: true,
    },
  },
  outputs: {
    safetyConfiguration: {
      type: 'Data',
      label: 'Safety Configuration',
    },
  },
  params: {
    zoneType: {
      type: 'enum',
      label: 'Zone Type',
      default: 'slow',
      options: ['stop', 'slow', 'warning'],
    },
    responseTime: {
      type: 'number',
      label: 'Response Time',
      default: 0.5,
      min: 0.1,
      max: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'safetyZoneSetup',
      params: {
        zones: inputs.zones,
        zoneType: params.zoneType,
        responseTime: params.responseTime,
      },
    });

    return {
      safetyConfiguration: result,
    };
  },
};
