import type { NodeDefinition } from '@sim4d/types';

interface BiomimeticStructureParams {
  inspiration: string;
  density: number;
}

interface BiomimeticStructureInputs {
  shape: unknown;
}

interface BiomimeticStructureOutputs {
  biomimetic: unknown;
}

export const SpecializedOrganicBiomimeticStructureNode: NodeDefinition<
  BiomimeticStructureInputs,
  BiomimeticStructureOutputs,
  BiomimeticStructureParams
> = {
  id: 'Specialized::BiomimeticStructure',
  type: 'Specialized::BiomimeticStructure',
  category: 'Specialized',
  label: 'BiomimeticStructure',
  description: 'Nature-inspired structures',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    biomimetic: {
      type: 'Shape',
      label: 'Biomimetic',
    },
  },
  params: {
    inspiration: {
      type: 'enum',
      label: 'Inspiration',
      default: 'bone',
      options: ['bone', 'wood', 'coral', 'leaf-veins'],
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 0.5,
      min: 0.1,
      max: 0.9,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'biomimeticStructure',
      params: {
        shape: inputs.shape,
        inspiration: params.inspiration,
        density: params.density,
      },
    });

    return {
      biomimetic: result,
    };
  },
};
