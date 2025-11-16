import type { NodeDefinition } from '@brepflow/types';

interface EndEffectorSetupParams {
  toolType: string;
  tcpOffset: [number, number, number];
}

interface EndEffectorSetupInputs {
  toolGeometry?: unknown;
}

interface EndEffectorSetupOutputs {
  toolConfiguration: unknown;
}

export const FabricationRoboticsEndEffectorSetupNode: NodeDefinition<
  EndEffectorSetupInputs,
  EndEffectorSetupOutputs,
  EndEffectorSetupParams
> = {
  id: 'Fabrication::EndEffectorSetup',
  type: 'Fabrication::EndEffectorSetup',
  category: 'Fabrication',
  label: 'EndEffectorSetup',
  description: 'Configure end effector',
  inputs: {
    toolGeometry: {
      type: 'Shape',
      label: 'Tool Geometry',
      optional: true,
    },
  },
  outputs: {
    toolConfiguration: {
      type: 'Data',
      label: 'Tool Configuration',
    },
  },
  params: {
    toolType: {
      type: 'enum',
      label: 'Tool Type',
      default: 'gripper',
      options: ['gripper', 'welder', 'extruder', 'mill', 'laser'],
    },
    tcpOffset: {
      type: 'vec3',
      label: 'Tcp Offset',
      default: '[0, 0, 100]',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'endEffectorSetup',
      params: {
        toolGeometry: inputs.toolGeometry,
        toolType: params.toolType,
        tcpOffset: params.tcpOffset,
      },
    });

    return {
      toolConfiguration: result,
    };
  },
};
