import type { NodeDefinition } from '@sim4d/types';

interface BrickPatternParams {
  bond: string;
  brickLength: number;
  brickWidth: number;
  mortarGap: number;
}

interface BrickPatternInputs {
  surface: unknown;
}

interface BrickPatternOutputs {
  bricks: unknown;
}

export const PatternsTilingBrickPatternNode: NodeDefinition<
  BrickPatternInputs,
  BrickPatternOutputs,
  BrickPatternParams
> = {
  id: 'Patterns::BrickPattern',
  category: 'Patterns',
  label: 'BrickPattern',
  description: 'Brick laying pattern',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    bricks: {
      type: 'Face[]',
      label: 'Bricks',
    },
  },
  params: {
    bond: {
      type: 'enum',
      label: 'Bond',
      default: 'running',
      options: ['running', 'stack', 'english', 'flemish', 'herringbone'],
    },
    brickLength: {
      type: 'number',
      label: 'Brick Length',
      default: 20,
      min: 1,
    },
    brickWidth: {
      type: 'number',
      label: 'Brick Width',
      default: 10,
      min: 1,
    },
    mortarGap: {
      type: 'number',
      label: 'Mortar Gap',
      default: 1,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'brickPattern',
      params: {
        surface: inputs.surface,
        bond: params.bond,
        brickLength: params.brickLength,
        brickWidth: params.brickWidth,
        mortarGap: params.mortarGap,
      },
    });

    return {
      bricks: result,
    };
  },
};
