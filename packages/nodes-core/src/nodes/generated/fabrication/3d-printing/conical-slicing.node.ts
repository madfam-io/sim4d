import type { NodeDefinition } from '@brepflow/types';

interface ConicalSlicingParams {
  axis: [number, number, number];
}

interface ConicalSlicingInputs {
  model: unknown;
}

interface ConicalSlicingOutputs {
  conicalSlices: unknown;
}

export const Fabrication3DPrintingConicalSlicingNode: NodeDefinition<
  ConicalSlicingInputs,
  ConicalSlicingOutputs,
  ConicalSlicingParams
> = {
  id: 'Fabrication::ConicalSlicing',
  category: 'Fabrication',
  label: 'ConicalSlicing',
  description: 'Conical/cylindrical slicing',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    conicalSlices: {
      type: 'Wire[]',
      label: 'Conical Slices',
    },
  },
  params: {
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: '[0, 0, 1]',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'conicalSlicing',
      params: {
        model: inputs.model,
        axis: params.axis,
      },
    });

    return {
      conicalSlices: result,
    };
  },
};
