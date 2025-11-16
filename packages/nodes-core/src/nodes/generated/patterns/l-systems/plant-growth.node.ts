import type { NodeDefinition } from '@brepflow/types';

interface PlantGrowthParams {
  species: string;
  age: number;
}

interface PlantGrowthInputs {
  ground: unknown;
}

interface PlantGrowthOutputs {
  plant: unknown;
}

export const PatternsLSystemsPlantGrowthNode: NodeDefinition<
  PlantGrowthInputs,
  PlantGrowthOutputs,
  PlantGrowthParams
> = {
  id: 'Patterns::PlantGrowth',
  category: 'Patterns',
  label: 'PlantGrowth',
  description: 'Parametric plant growth',
  inputs: {
    ground: {
      type: 'Plane',
      label: 'Ground',
      required: true,
    },
  },
  outputs: {
    plant: {
      type: 'Wire[]',
      label: 'Plant',
    },
  },
  params: {
    species: {
      type: 'enum',
      label: 'Species',
      default: 'fern',
      options: ['fern', 'bush', 'weed', 'algae', 'moss'],
    },
    age: {
      type: 'number',
      label: 'Age',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'plantGrowth',
      params: {
        ground: inputs.ground,
        species: params.species,
        age: params.age,
      },
    });

    return {
      plant: result,
    };
  },
};
