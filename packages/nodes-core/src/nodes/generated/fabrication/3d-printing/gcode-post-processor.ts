import type { NodeDefinition } from '@brepflow/types';

interface GCodePostProcessorParams {
  flavor: string;
  optimize: boolean;
}

interface GCodePostProcessorInputs {
  toolpaths: unknown;
}

interface GCodePostProcessorOutputs {
  gcode: unknown;
}

export const Fabrication3DPrintingGCodePostProcessorNode: NodeDefinition<
  GCodePostProcessorInputs,
  GCodePostProcessorOutputs,
  GCodePostProcessorParams
> = {
  id: 'Fabrication::GCodePostProcessor',
  type: 'Fabrication::GCodePostProcessor',
  category: 'Fabrication',
  label: 'GCodePostProcessor',
  description: 'Post-process G-code',
  inputs: {
    toolpaths: {
      type: 'Wire[]',
      label: 'Toolpaths',
      required: true,
    },
  },
  outputs: {
    gcode: {
      type: 'Data',
      label: 'Gcode',
    },
  },
  params: {
    flavor: {
      type: 'enum',
      label: 'Flavor',
      default: 'marlin',
      options: ['marlin', 'reprap', 'klipper', 'smoothie'],
    },
    optimize: {
      type: 'boolean',
      label: 'Optimize',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'gcodePostProcessor',
      params: {
        toolpaths: inputs.toolpaths,
        flavor: params.flavor,
        optimize: params.optimize,
      },
    });

    return {
      gcode: result,
    };
  },
};
