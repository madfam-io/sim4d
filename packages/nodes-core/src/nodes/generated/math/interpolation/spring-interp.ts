import type { NodeDefinition } from '@sim4d/types';

interface SpringInterpParams {
  stiffness: number;
  damping: number;
}

interface SpringInterpInputs {
  current: unknown;
  target: unknown;
  velocity: unknown;
  deltaTime: unknown;
}

interface SpringInterpOutputs {
  position: unknown;
  velocity: unknown;
}

export const MathInterpolationSpringInterpNode: NodeDefinition<
  SpringInterpInputs,
  SpringInterpOutputs,
  SpringInterpParams
> = {
  id: 'Math::SpringInterp',
  type: 'Math::SpringInterp',
  category: 'Math',
  label: 'SpringInterp',
  description: 'Spring interpolation',
  inputs: {
    current: {
      type: 'number',
      label: 'Current',
      required: true,
    },
    target: {
      type: 'number',
      label: 'Target',
      required: true,
    },
    velocity: {
      type: 'number',
      label: 'Velocity',
      required: true,
    },
    deltaTime: {
      type: 'number',
      label: 'Delta Time',
      required: true,
    },
  },
  outputs: {
    position: {
      type: 'number',
      label: 'Position',
    },
    velocity: {
      type: 'number',
      label: 'Velocity',
    },
  },
  params: {
    stiffness: {
      type: 'number',
      label: 'Stiffness',
      default: 100,
      min: 1,
      max: 1000,
    },
    damping: {
      type: 'number',
      label: 'Damping',
      default: 10,
      min: 0,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mathSpringInterp',
      params: {
        current: inputs.current,
        target: inputs.target,
        velocity: inputs.velocity,
        deltaTime: inputs.deltaTime,
        stiffness: params.stiffness,
        damping: params.damping,
      },
    });

    return {
      position: results.position,
      velocity: results.velocity,
    };
  },
};
