import type { NodeDefinition } from '@brepflow/types';

interface CutQualityParams {
  speed: number;
  power: number;
}

interface CutQualityInputs {
  material: unknown;
}

interface CutQualityOutputs {
  edgeQuality: unknown;
  heatAffectedZone: number;
}

export const FabricationLaserCutQualityNode: NodeDefinition<
  CutQualityInputs,
  CutQualityOutputs,
  CutQualityParams
> = {
  id: 'Fabrication::CutQuality',
  category: 'Fabrication',
  label: 'CutQuality',
  description: 'Predict cut quality',
  inputs: {
    material: {
      type: 'Data',
      label: 'Material',
      required: true,
    },
  },
  outputs: {
    edgeQuality: {
      type: 'Data',
      label: 'Edge Quality',
    },
    heatAffectedZone: {
      type: 'Number',
      label: 'Heat Affected Zone',
    },
  },
  params: {
    speed: {
      type: 'number',
      label: 'Speed',
      default: 20,
      min: 1,
      max: 100,
    },
    power: {
      type: 'number',
      label: 'Power',
      default: 80,
      min: 10,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'cutQuality',
      params: {
        material: inputs.material,
        speed: params.speed,
        power: params.power,
      },
    });

    return {
      edgeQuality: results.edgeQuality,
      heatAffectedZone: results.heatAffectedZone,
    };
  },
};
