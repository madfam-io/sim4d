import type { NodeDefinition } from '@sim4d/types';

interface NonPlanarSlicingParams {
  maxAngle: number;
}

interface NonPlanarSlicingInputs {
  model: unknown;
}

interface NonPlanarSlicingOutputs {
  nonPlanarSlices: unknown;
}

export const Fabrication3DPrintingNonPlanarSlicingNode: NodeDefinition<
  NonPlanarSlicingInputs,
  NonPlanarSlicingOutputs,
  NonPlanarSlicingParams
> = {
  id: 'Fabrication::NonPlanarSlicing',
  type: 'Fabrication::NonPlanarSlicing',
  category: 'Fabrication',
  label: 'NonPlanarSlicing',
  description: 'Non-planar slicing paths',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    nonPlanarSlices: {
      type: 'Wire[]',
      label: 'Non Planar Slices',
    },
  },
  params: {
    maxAngle: {
      type: 'number',
      label: 'Max Angle',
      default: 30,
      min: 0,
      max: 60,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'nonPlanarSlicing',
      params: {
        model: inputs.model,
        maxAngle: params.maxAngle,
      },
    });

    return {
      nonPlanarSlices: result,
    };
  },
};
