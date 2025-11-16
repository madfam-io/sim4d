import type { NodeDefinition } from '@brepflow/types';

interface PedestalPaversParams {
  paverSize: number;
  pedestalHeight: number;
}

interface PedestalPaversInputs {
  area: unknown;
}

interface PedestalPaversOutputs {
  pavers: unknown;
  pedestals: unknown;
}

export const ArchitectureFloorsPedestalPaversNode: NodeDefinition<
  PedestalPaversInputs,
  PedestalPaversOutputs,
  PedestalPaversParams
> = {
  id: 'Architecture::PedestalPavers',
  type: 'Architecture::PedestalPavers',
  category: 'Architecture',
  label: 'PedestalPavers',
  description: 'Pedestal paver system',
  inputs: {
    area: {
      type: 'Face',
      label: 'Area',
      required: true,
    },
  },
  outputs: {
    pavers: {
      type: 'Face[]',
      label: 'Pavers',
    },
    pedestals: {
      type: 'Shape[]',
      label: 'Pedestals',
    },
  },
  params: {
    paverSize: {
      type: 'number',
      label: 'Paver Size',
      default: 600,
      min: 300,
      max: 900,
    },
    pedestalHeight: {
      type: 'number',
      label: 'Pedestal Height',
      default: 100,
      min: 25,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pedestalPavers',
      params: {
        area: inputs.area,
        paverSize: params.paverSize,
        pedestalHeight: params.pedestalHeight,
      },
    });

    return {
      pavers: results.pavers,
      pedestals: results.pedestals,
    };
  },
};
