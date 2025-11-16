import type { NodeDefinition } from '@brepflow/types';

interface FocusCompensationParams {
  focalLength: number;
  beamDivergence: number;
}

interface FocusCompensationInputs {
  surface: unknown;
}

interface FocusCompensationOutputs {
  focusMap: unknown;
}

export const FabricationLaserFocusCompensationNode: NodeDefinition<
  FocusCompensationInputs,
  FocusCompensationOutputs,
  FocusCompensationParams
> = {
  id: 'Fabrication::FocusCompensation',
  category: 'Fabrication',
  label: 'FocusCompensation',
  description: 'Focus height compensation',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    focusMap: {
      type: 'Data',
      label: 'Focus Map',
    },
  },
  params: {
    focalLength: {
      type: 'number',
      label: 'Focal Length',
      default: 50,
      min: 20,
      max: 200,
    },
    beamDivergence: {
      type: 'number',
      label: 'Beam Divergence',
      default: 2,
      min: 0.5,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'focusCompensation',
      params: {
        surface: inputs.surface,
        focalLength: params.focalLength,
        beamDivergence: params.beamDivergence,
      },
    });

    return {
      focusMap: result,
    };
  },
};
