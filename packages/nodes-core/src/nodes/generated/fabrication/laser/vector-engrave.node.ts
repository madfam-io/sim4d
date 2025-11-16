import type { NodeDefinition } from '@brepflow/types';

interface VectorEngraveParams {
  depth: number;
  passes: number;
}

interface VectorEngraveInputs {
  vectors: unknown;
}

interface VectorEngraveOutputs {
  engravePaths: unknown;
}

export const FabricationLaserVectorEngraveNode: NodeDefinition<
  VectorEngraveInputs,
  VectorEngraveOutputs,
  VectorEngraveParams
> = {
  id: 'Fabrication::VectorEngrave',
  category: 'Fabrication',
  label: 'VectorEngrave',
  description: 'Vector engraving paths',
  inputs: {
    vectors: {
      type: 'Wire[]',
      label: 'Vectors',
      required: true,
    },
  },
  outputs: {
    engravePaths: {
      type: 'Wire[]',
      label: 'Engrave Paths',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 0.5,
      min: 0.1,
      max: 5,
    },
    passes: {
      type: 'number',
      label: 'Passes',
      default: 1,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'vectorEngrave',
      params: {
        vectors: inputs.vectors,
        depth: params.depth,
        passes: params.passes,
      },
    });

    return {
      engravePaths: result,
    };
  },
};
