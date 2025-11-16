import type { NodeDefinition } from '@brepflow/types';

interface ScallopHeightParams {
  ballRadius: number;
  stepover: number;
}

interface ScallopHeightInputs {
  surface: unknown;
}

interface ScallopHeightOutputs {
  scallopMap: unknown;
  maxScallop: number;
}

export const FabricationCNCScallopHeightNode: NodeDefinition<
  ScallopHeightInputs,
  ScallopHeightOutputs,
  ScallopHeightParams
> = {
  id: 'Fabrication::ScallopHeight',
  type: 'Fabrication::ScallopHeight',
  category: 'Fabrication',
  label: 'ScallopHeight',
  description: 'Calculate scallop height',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    scallopMap: {
      type: 'Data',
      label: 'Scallop Map',
    },
    maxScallop: {
      type: 'Number',
      label: 'Max Scallop',
    },
  },
  params: {
    ballRadius: {
      type: 'number',
      label: 'Ball Radius',
      default: 3,
      min: 0.5,
      max: 25,
    },
    stepover: {
      type: 'number',
      label: 'Stepover',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'scallopHeight',
      params: {
        surface: inputs.surface,
        ballRadius: params.ballRadius,
        stepover: params.stepover,
      },
    });

    return {
      scallopMap: results.scallopMap,
      maxScallop: results.maxScallop,
    };
  },
};
