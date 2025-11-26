import type { NodeDefinition } from '@sim4d/types';

interface PostTensionedSlabParams {
  slabThickness: number;
  tendonSpacing: number;
}

interface PostTensionedSlabInputs {
  slabOutline: unknown;
  columnPoints?: Array<[number, number, number]>;
}

interface PostTensionedSlabOutputs {
  ptSlab: unknown;
  tendons: unknown;
}

export const ArchitectureFloorsPostTensionedSlabNode: NodeDefinition<
  PostTensionedSlabInputs,
  PostTensionedSlabOutputs,
  PostTensionedSlabParams
> = {
  id: 'Architecture::PostTensionedSlab',
  type: 'Architecture::PostTensionedSlab',
  category: 'Architecture',
  label: 'PostTensionedSlab',
  description: 'Post-tensioned concrete slab',
  inputs: {
    slabOutline: {
      type: 'Wire',
      label: 'Slab Outline',
      required: true,
    },
    columnPoints: {
      type: 'Point[]',
      label: 'Column Points',
      optional: true,
    },
  },
  outputs: {
    ptSlab: {
      type: 'Shape',
      label: 'Pt Slab',
    },
    tendons: {
      type: 'Wire[]',
      label: 'Tendons',
    },
  },
  params: {
    slabThickness: {
      type: 'number',
      label: 'Slab Thickness',
      default: 200,
      min: 150,
      max: 400,
    },
    tendonSpacing: {
      type: 'number',
      label: 'Tendon Spacing',
      default: 1200,
      min: 900,
      max: 1800,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'postTensionedSlab',
      params: {
        slabOutline: inputs.slabOutline,
        columnPoints: inputs.columnPoints,
        slabThickness: params.slabThickness,
        tendonSpacing: params.tendonSpacing,
      },
    });

    return {
      ptSlab: results.ptSlab,
      tendons: results.tendons,
    };
  },
};
