import type { NodeDefinition } from '@brepflow/types';

interface SweepParams {
  twistAngle: number;
  scaleFactor: number;
  keepOrientation: boolean;
  solid: boolean;
}

interface SweepInputs {
  profile: unknown;
  path: unknown;
  auxiliarySpine?: unknown;
}

interface SweepOutputs {
  shape: unknown;
}

export const AdvancedSweepSweepNode: NodeDefinition<SweepInputs, SweepOutputs, SweepParams> = {
  id: 'Advanced::Sweep',
  type: 'Advanced::Sweep',
  category: 'Advanced',
  label: 'Sweep',
  description: 'Sweep profile along path',
  inputs: {
    profile: {
      type: 'Wire',
      label: 'Profile',
      required: true,
    },
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
    auxiliarySpine: {
      type: 'Wire',
      label: 'Auxiliary Spine',
      optional: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    twistAngle: {
      type: 'number',
      label: 'Twist Angle',
      default: 0,
      min: -360,
      max: 360,
    },
    scaleFactor: {
      type: 'number',
      label: 'Scale Factor',
      default: 1,
      min: 0.01,
      max: 100,
    },
    keepOrientation: {
      type: 'boolean',
      label: 'Keep Orientation',
      default: false,
    },
    solid: {
      type: 'boolean',
      label: 'Solid',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sweep',
      params: {
        profile: inputs.profile,
        path: inputs.path,
        auxiliarySpine: inputs.auxiliarySpine,
        twistAngle: params.twistAngle,
        scaleFactor: params.scaleFactor,
        keepOrientation: params.keepOrientation,
        solid: params.solid,
      },
    });

    return {
      shape: result,
    };
  },
};
