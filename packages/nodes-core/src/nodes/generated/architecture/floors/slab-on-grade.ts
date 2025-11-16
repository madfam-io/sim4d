import type { NodeDefinition } from '@brepflow/types';

interface SlabOnGradeParams {
  thickness: number;
  vaporBarrier: boolean;
  insulation: boolean;
}

interface SlabOnGradeInputs {
  boundary: unknown;
}

interface SlabOnGradeOutputs {
  slab: unknown;
}

export const ArchitectureFloorsSlabOnGradeNode: NodeDefinition<
  SlabOnGradeInputs,
  SlabOnGradeOutputs,
  SlabOnGradeParams
> = {
  id: 'Architecture::SlabOnGrade',
  type: 'Architecture::SlabOnGrade',
  category: 'Architecture',
  label: 'SlabOnGrade',
  description: 'Concrete slab on grade',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    slab: {
      type: 'Shape',
      label: 'Slab',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 150,
      min: 100,
      max: 300,
    },
    vaporBarrier: {
      type: 'boolean',
      label: 'Vapor Barrier',
      default: true,
    },
    insulation: {
      type: 'boolean',
      label: 'Insulation',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'slabOnGrade',
      params: {
        boundary: inputs.boundary,
        thickness: params.thickness,
        vaporBarrier: params.vaporBarrier,
        insulation: params.insulation,
      },
    });

    return {
      slab: result,
    };
  },
};
