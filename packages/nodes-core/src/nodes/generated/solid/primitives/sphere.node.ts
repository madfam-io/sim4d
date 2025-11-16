import type { NodeDefinition } from '@brepflow/types';

interface SphereParams {
  radius: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  angle1: number;
  angle2: number;
  angle3: number;
}

type SphereInputs = Record<string, never>;

interface SphereOutputs {
  solid: unknown;
}

export const SolidPrimitivesSphereNode: NodeDefinition<SphereInputs, SphereOutputs, SphereParams> =
  {
    id: 'Solid::Sphere',
    category: 'Solid',
    label: 'Sphere',
    description: 'Create a parametric sphere',
    inputs: {},
    outputs: {
      solid: {
        type: 'Solid',
        label: 'Solid',
      },
    },
    params: {
      radius: {
        type: 'number',
        label: 'Radius',
        default: 50,
        min: 0.1,
        max: 10000,
      },
      centerX: {
        type: 'number',
        label: 'Center X',
        default: 0,
        min: -10000,
        max: 10000,
      },
      centerY: {
        type: 'number',
        label: 'Center Y',
        default: 0,
        min: -10000,
        max: 10000,
      },
      centerZ: {
        type: 'number',
        label: 'Center Z',
        default: 0,
        min: -10000,
        max: 10000,
      },
      angle1: {
        type: 'number',
        label: 'Angle1',
        default: 0,
        min: -180,
        max: 180,
      },
      angle2: {
        type: 'number',
        label: 'Angle2',
        default: 360,
        min: 0,
        max: 360,
      },
      angle3: {
        type: 'number',
        label: 'Angle3',
        default: 180,
        min: 0,
        max: 180,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'makeSphere',
        params: {
          radius: params.radius,
          centerX: params.centerX,
          centerY: params.centerY,
          centerZ: params.centerZ,
          angle1: params.angle1,
          angle2: params.angle2,
          angle3: params.angle3,
        },
      });

      return {
        solid: result,
      };
    },
  };
