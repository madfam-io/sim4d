import type { NodeDefinition } from '@brepflow/types';

interface KerfBendingParams {
  bendRadius: number;
  materialThickness: number;
  kerfWidth: number;
}

interface KerfBendingInputs {
  bendZone: unknown;
}

interface KerfBendingOutputs {
  kerfPattern: unknown;
}

export const FabricationLaserKerfBendingNode: NodeDefinition<
  KerfBendingInputs,
  KerfBendingOutputs,
  KerfBendingParams
> = {
  id: 'Fabrication::KerfBending',
  category: 'Fabrication',
  label: 'KerfBending',
  description: 'Kerf bending patterns',
  inputs: {
    bendZone: {
      type: 'Face',
      label: 'Bend Zone',
      required: true,
    },
  },
  outputs: {
    kerfPattern: {
      type: 'Wire[]',
      label: 'Kerf Pattern',
    },
  },
  params: {
    bendRadius: {
      type: 'number',
      label: 'Bend Radius',
      default: 50,
      min: 10,
      max: 500,
    },
    materialThickness: {
      type: 'number',
      label: 'Material Thickness',
      default: 3,
      min: 0.5,
      max: 20,
    },
    kerfWidth: {
      type: 'number',
      label: 'Kerf Width',
      default: 0.15,
      min: 0.05,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'kerfBending',
      params: {
        bendZone: inputs.bendZone,
        bendRadius: params.bendRadius,
        materialThickness: params.materialThickness,
        kerfWidth: params.kerfWidth,
      },
    });

    return {
      kerfPattern: result,
    };
  },
};
