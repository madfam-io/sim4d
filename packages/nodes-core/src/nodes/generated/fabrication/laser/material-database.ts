import type { NodeDefinition } from '@brepflow/types';

interface MaterialDatabaseParams {
  material: string;
  thickness: number;
}

type MaterialDatabaseInputs = Record<string, never>;

interface MaterialDatabaseOutputs {
  cuttingSpeed: number;
  power: number;
  frequency: number;
}

export const FabricationLaserMaterialDatabaseNode: NodeDefinition<
  MaterialDatabaseInputs,
  MaterialDatabaseOutputs,
  MaterialDatabaseParams
> = {
  id: 'Fabrication::MaterialDatabase',
  type: 'Fabrication::MaterialDatabase',
  category: 'Fabrication',
  label: 'MaterialDatabase',
  description: 'Material cutting database',
  inputs: {},
  outputs: {
    cuttingSpeed: {
      type: 'Number',
      label: 'Cutting Speed',
    },
    power: {
      type: 'Number',
      label: 'Power',
    },
    frequency: {
      type: 'Number',
      label: 'Frequency',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'acrylic',
      options: ['acrylic', 'plywood', 'mdf', 'leather', 'paper', 'fabric'],
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 3,
      min: 0.1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'materialDatabase',
      params: {
        material: params.material,
        thickness: params.thickness,
      },
    });

    return {
      cuttingSpeed: results.cuttingSpeed,
      power: results.power,
      frequency: results.frequency,
    };
  },
};
