import type { NodeDefinition } from '@brepflow/types';

interface RevolvingDoorParams {
  diameter: number;
  wings: number;
  rotation: number;
}

interface RevolvingDoorInputs {
  center: [number, number, number];
}

interface RevolvingDoorOutputs {
  revolvingDoor: unknown;
}

export const ArchitectureDoorsRevolvingDoorNode: NodeDefinition<
  RevolvingDoorInputs,
  RevolvingDoorOutputs,
  RevolvingDoorParams
> = {
  id: 'Architecture::RevolvingDoor',
  type: 'Architecture::RevolvingDoor',
  category: 'Architecture',
  label: 'RevolvingDoor',
  description: 'Revolving door entry',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    revolvingDoor: {
      type: 'Shape',
      label: 'Revolving Door',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 2000,
      min: 1800,
      max: 3000,
    },
    wings: {
      type: 'number',
      label: 'Wings',
      default: 4,
      min: 3,
      max: 4,
      step: 1,
    },
    rotation: {
      type: 'number',
      label: 'Rotation',
      default: 0,
      min: 0,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'revolvingDoor',
      params: {
        center: inputs.center,
        diameter: params.diameter,
        wings: params.wings,
        rotation: params.rotation,
      },
    });

    return {
      revolvingDoor: result,
    };
  },
};
