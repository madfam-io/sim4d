import type { NodeDefinition } from '@sim4d/types';

interface ShapeDescriptorParams {
  descriptor: string;
  resolution: number;
  normalize: boolean;
}

interface ShapeDescriptorInputs {
  shape: unknown;
}

interface ShapeDescriptorOutputs {
  descriptor: unknown;
  features: unknown;
  similarity: unknown;
}

export const AlgorithmicGeometryShapeDescriptorNode: NodeDefinition<
  ShapeDescriptorInputs,
  ShapeDescriptorOutputs,
  ShapeDescriptorParams
> = {
  id: 'Algorithmic::ShapeDescriptor',
  type: 'Algorithmic::ShapeDescriptor',
  category: 'Algorithmic',
  label: 'ShapeDescriptor',
  description: 'Compute geometric shape descriptors',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    descriptor: {
      type: 'number[]',
      label: 'Descriptor',
    },
    features: {
      type: 'Properties',
      label: 'Features',
    },
    similarity: {
      type: 'number',
      label: 'Similarity',
    },
  },
  params: {
    descriptor: {
      type: 'enum',
      label: 'Descriptor',
      default: 'moments',
      options: ['moments', 'fourier', 'histogram'],
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 32,
      min: 8,
      max: 128,
    },
    normalize: {
      type: 'boolean',
      label: 'Normalize',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'shapeDescriptor',
      params: {
        shape: inputs.shape,
        descriptor: params.descriptor,
        resolution: params.resolution,
        normalize: params.normalize,
      },
    });

    return {
      descriptor: results.descriptor,
      features: results.features,
      similarity: results.similarity,
    };
  },
};
