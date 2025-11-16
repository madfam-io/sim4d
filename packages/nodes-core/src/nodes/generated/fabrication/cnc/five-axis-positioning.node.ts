import type { NodeDefinition } from '@brepflow/types';

interface FiveAxisPositioningParams {
  leadAngle: number;
  tiltAngle: number;
}

interface FiveAxisPositioningInputs {
  surface: unknown;
  toolAxis?: [number, number, number];
}

interface FiveAxisPositioningOutputs {
  toolOrientations: unknown;
}

export const FabricationCNCFiveAxisPositioningNode: NodeDefinition<
  FiveAxisPositioningInputs,
  FiveAxisPositioningOutputs,
  FiveAxisPositioningParams
> = {
  id: 'Fabrication::FiveAxisPositioning',
  category: 'Fabrication',
  label: 'FiveAxisPositioning',
  description: '5-axis positioning strategy',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    toolAxis: {
      type: 'Vector',
      label: 'Tool Axis',
      optional: true,
    },
  },
  outputs: {
    toolOrientations: {
      type: 'Transform[]',
      label: 'Tool Orientations',
    },
  },
  params: {
    leadAngle: {
      type: 'number',
      label: 'Lead Angle',
      default: 10,
      min: 0,
      max: 45,
    },
    tiltAngle: {
      type: 'number',
      label: 'Tilt Angle',
      default: 0,
      min: -90,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fiveAxisPositioning',
      params: {
        surface: inputs.surface,
        toolAxis: inputs.toolAxis,
        leadAngle: params.leadAngle,
        tiltAngle: params.tiltAngle,
      },
    });

    return {
      toolOrientations: result,
    };
  },
};
