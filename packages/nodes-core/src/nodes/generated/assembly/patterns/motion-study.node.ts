import type { NodeDefinition } from '@sim4d/types';

interface MotionStudyParams {
  steps: number;
  duration: number;
}

interface MotionStudyInputs {
  assembly: unknown;
  drivers: unknown;
}

interface MotionStudyOutputs {
  frames: unknown;
  collisions: unknown;
}

export const AssemblyPatternsMotionStudyNode: NodeDefinition<
  MotionStudyInputs,
  MotionStudyOutputs,
  MotionStudyParams
> = {
  id: 'Assembly::MotionStudy',
  category: 'Assembly',
  label: 'MotionStudy',
  description: 'Analyze assembly motion',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
    drivers: {
      type: 'Driver[]',
      label: 'Drivers',
      required: true,
    },
  },
  outputs: {
    frames: {
      type: 'Frame[]',
      label: 'Frames',
    },
    collisions: {
      type: 'Collision[]',
      label: 'Collisions',
    },
  },
  params: {
    steps: {
      type: 'number',
      label: 'Steps',
      default: 10,
      min: 2,
      max: 100,
    },
    duration: {
      type: 'number',
      label: 'Duration',
      default: 1,
      min: 0.1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'assemblyMotion',
      params: {
        assembly: inputs.assembly,
        drivers: inputs.drivers,
        steps: params.steps,
        duration: params.duration,
      },
    });

    return {
      frames: results.frames,
      collisions: results.collisions,
    };
  },
};
