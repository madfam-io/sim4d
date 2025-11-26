import type { NodeDefinition } from '@sim4d/types';

interface StairNosingParams {
  projection: number;
  material: string;
}

interface StairNosingInputs {
  treadEdges: unknown;
}

interface StairNosingOutputs {
  nosing: unknown;
}

export const ArchitectureStairsStairNosingNode: NodeDefinition<
  StairNosingInputs,
  StairNosingOutputs,
  StairNosingParams
> = {
  id: 'Architecture::StairNosing',
  type: 'Architecture::StairNosing',
  category: 'Architecture',
  label: 'StairNosing',
  description: 'Stair nosing profile',
  inputs: {
    treadEdges: {
      type: 'Edge[]',
      label: 'Tread Edges',
      required: true,
    },
  },
  outputs: {
    nosing: {
      type: 'Shape[]',
      label: 'Nosing',
    },
  },
  params: {
    projection: {
      type: 'number',
      label: 'Projection',
      default: 25,
      min: 20,
      max: 40,
    },
    material: {
      type: 'enum',
      label: 'Material',
      default: 'aluminum',
      options: ['aluminum', 'rubber', 'wood', 'stone'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stairNosing',
      params: {
        treadEdges: inputs.treadEdges,
        projection: params.projection,
        material: params.material,
      },
    });

    return {
      nosing: result,
    };
  },
};
