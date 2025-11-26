import type { NodeDefinition } from '@sim4d/types';

interface BoundingBoxAlignParams {
  alignToOrigin: boolean;
  alignCorner: string;
}

interface BoundingBoxAlignInputs {
  shape: unknown;
}

interface BoundingBoxAlignOutputs {
  aligned: unknown;
  boundingBox: unknown;
}

export const TransformBoundingBoxAlignNode: NodeDefinition<
  BoundingBoxAlignInputs,
  BoundingBoxAlignOutputs,
  BoundingBoxAlignParams
> = {
  id: 'Transform::BoundingBoxAlign',
  category: 'Transform',
  label: 'BoundingBoxAlign',
  description: 'Align shape to its bounding box',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    aligned: {
      type: 'Shape',
      label: 'Aligned',
    },
    boundingBox: {
      type: 'Shape',
      label: 'Bounding Box',
    },
  },
  params: {
    alignToOrigin: {
      type: 'boolean',
      label: 'Align To Origin',
      default: true,
    },
    alignCorner: {
      type: 'enum',
      label: 'Align Corner',
      default: 'min',
      options: ['min', 'center', 'max'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'transformBBoxAlign',
      params: {
        shape: inputs.shape,
        alignToOrigin: params.alignToOrigin,
        alignCorner: params.alignCorner,
      },
    });

    return {
      aligned: results.aligned,
      boundingBox: results.boundingBox,
    };
  },
};
