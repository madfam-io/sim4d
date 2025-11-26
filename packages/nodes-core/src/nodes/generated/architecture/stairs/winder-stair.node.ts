import type { NodeDefinition } from '@sim4d/types';

interface WinderStairParams {
  winderCount: number;
  turnAngle: number;
}

interface WinderStairInputs {
  path: unknown;
}

interface WinderStairOutputs {
  winderStair: unknown;
}

export const ArchitectureStairsWinderStairNode: NodeDefinition<
  WinderStairInputs,
  WinderStairOutputs,
  WinderStairParams
> = {
  id: 'Architecture::WinderStair',
  category: 'Architecture',
  label: 'WinderStair',
  description: 'Winder staircase',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    winderStair: {
      type: 'Shape',
      label: 'Winder Stair',
    },
  },
  params: {
    winderCount: {
      type: 'number',
      label: 'Winder Count',
      default: 3,
      min: 2,
      max: 5,
      step: 1,
    },
    turnAngle: {
      type: 'number',
      label: 'Turn Angle',
      default: 90,
      min: 45,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'winderStair',
      params: {
        path: inputs.path,
        winderCount: params.winderCount,
        turnAngle: params.turnAngle,
      },
    });

    return {
      winderStair: result,
    };
  },
};
