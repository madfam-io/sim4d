import type { NodeDefinition } from '@sim4d/types';

interface PerimeterGeneratorParams {
  perimeters: number;
  extrusionWidth: number;
}

interface PerimeterGeneratorInputs {
  slice: unknown;
}

interface PerimeterGeneratorOutputs {
  perimeters: unknown;
}

export const Fabrication3DPrintingPerimeterGeneratorNode: NodeDefinition<
  PerimeterGeneratorInputs,
  PerimeterGeneratorOutputs,
  PerimeterGeneratorParams
> = {
  id: 'Fabrication::PerimeterGenerator',
  category: 'Fabrication',
  label: 'PerimeterGenerator',
  description: 'Generate perimeter paths',
  inputs: {
    slice: {
      type: 'Wire',
      label: 'Slice',
      required: true,
    },
  },
  outputs: {
    perimeters: {
      type: 'Wire[]',
      label: 'Perimeters',
    },
  },
  params: {
    perimeters: {
      type: 'number',
      label: 'Perimeters',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    extrusionWidth: {
      type: 'number',
      label: 'Extrusion Width',
      default: 0.4,
      min: 0.1,
      max: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'perimeterGenerator',
      params: {
        slice: inputs.slice,
        perimeters: params.perimeters,
        extrusionWidth: params.extrusionWidth,
      },
    });

    return {
      perimeters: result,
    };
  },
};
