import type { NodeDefinition } from '@brepflow/types';

interface MountingBossParams {
  outerDiameter: number;
  innerDiameter: number;
  height: number;
  draftAngle: number;
}

interface MountingBossInputs {
  face: unknown;
  position: [number, number, number];
}

interface MountingBossOutputs {
  shape: unknown;
}

export const FeaturesStructuralMountingBossNode: NodeDefinition<
  MountingBossInputs,
  MountingBossOutputs,
  MountingBossParams
> = {
  id: 'Features::MountingBoss',
  category: 'Features',
  label: 'MountingBoss',
  description: 'Creates a mounting boss for screws',
  inputs: {
    face: {
      type: 'Face',
      label: 'Face',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 12,
      min: 1,
      max: 200,
    },
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 5,
      min: 0.1,
      max: 190,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    draftAngle: {
      type: 'number',
      label: 'Draft Angle',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'MAKE_BOSS',
      params: {
        face: inputs.face,
        position: inputs.position,
        outerDiameter: params.outerDiameter,
        innerDiameter: params.innerDiameter,
        height: params.height,
        draftAngle: params.draftAngle,
      },
    });

    return {
      shape: result,
    };
  },
};
