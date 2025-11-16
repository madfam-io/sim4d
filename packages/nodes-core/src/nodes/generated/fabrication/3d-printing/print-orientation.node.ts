import type { NodeDefinition } from '@brepflow/types';

interface PrintOrientationParams {
  optimize: string;
  constraints: boolean;
}

interface PrintOrientationInputs {
  model: unknown;
}

interface PrintOrientationOutputs {
  orientation: unknown;
  orientedModel: unknown;
}

export const Fabrication3DPrintingPrintOrientationNode: NodeDefinition<
  PrintOrientationInputs,
  PrintOrientationOutputs,
  PrintOrientationParams
> = {
  id: 'Fabrication::PrintOrientation',
  category: 'Fabrication',
  label: 'PrintOrientation',
  description: 'Optimize print orientation',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    orientation: {
      type: 'Transform',
      label: 'Orientation',
    },
    orientedModel: {
      type: 'Shape',
      label: 'Oriented Model',
    },
  },
  params: {
    optimize: {
      type: 'enum',
      label: 'Optimize',
      default: 'support',
      options: ['support', 'strength', 'time', 'quality'],
    },
    constraints: {
      type: 'boolean',
      label: 'Constraints',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'printOrientation',
      params: {
        model: inputs.model,
        optimize: params.optimize,
        constraints: params.constraints,
      },
    });

    return {
      orientation: results.orientation,
      orientedModel: results.orientedModel,
    };
  },
};
