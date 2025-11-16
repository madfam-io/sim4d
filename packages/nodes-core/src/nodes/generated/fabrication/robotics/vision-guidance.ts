import type { NodeDefinition } from '@brepflow/types';

interface VisionGuidanceParams {
  cameraType: string;
  patternType: string;
}

interface VisionGuidanceInputs {
  targetFeatures: unknown;
}

interface VisionGuidanceOutputs {
  detectedPoses: unknown;
}

export const FabricationRoboticsVisionGuidanceNode: NodeDefinition<
  VisionGuidanceInputs,
  VisionGuidanceOutputs,
  VisionGuidanceParams
> = {
  id: 'Fabrication::VisionGuidance',
  type: 'Fabrication::VisionGuidance',
  category: 'Fabrication',
  label: 'VisionGuidance',
  description: 'Vision-guided robotics',
  inputs: {
    targetFeatures: {
      type: 'Shape[]',
      label: 'Target Features',
      required: true,
    },
  },
  outputs: {
    detectedPoses: {
      type: 'Transform[]',
      label: 'Detected Poses',
    },
  },
  params: {
    cameraType: {
      type: 'enum',
      label: 'Camera Type',
      default: '3d',
      options: ['2d', '3d', 'stereo'],
    },
    patternType: {
      type: 'enum',
      label: 'Pattern Type',
      default: 'aruco',
      options: ['checkerboard', 'aruco', 'feature'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'visionGuidance',
      params: {
        targetFeatures: inputs.targetFeatures,
        cameraType: params.cameraType,
        patternType: params.patternType,
      },
    });

    return {
      detectedPoses: result,
    };
  },
};
