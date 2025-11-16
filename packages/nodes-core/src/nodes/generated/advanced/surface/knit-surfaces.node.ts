import type { NodeDefinition } from '@brepflow/types';

interface KnitSurfacesParams {
  tolerance: number;
  createSolid: boolean;
}

interface KnitSurfacesInputs {
  surfaces: unknown;
}

interface KnitSurfacesOutputs {
  knittedShape: unknown;
}

export const AdvancedSurfaceKnitSurfacesNode: NodeDefinition<
  KnitSurfacesInputs,
  KnitSurfacesOutputs,
  KnitSurfacesParams
> = {
  id: 'Advanced::KnitSurfaces',
  category: 'Advanced',
  label: 'KnitSurfaces',
  description: 'Knit surfaces together',
  inputs: {
    surfaces: {
      type: 'Face[]',
      label: 'Surfaces',
      required: true,
    },
  },
  outputs: {
    knittedShape: {
      type: 'Shape',
      label: 'Knitted Shape',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    createSolid: {
      type: 'boolean',
      label: 'Create Solid',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'knitSurfaces',
      params: {
        surfaces: inputs.surfaces,
        tolerance: params.tolerance,
        createSolid: params.createSolid,
      },
    });

    return {
      knittedShape: result,
    };
  },
};
