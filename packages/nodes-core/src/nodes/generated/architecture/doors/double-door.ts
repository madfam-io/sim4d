import type { NodeDefinition } from '@sim4d/types';

interface DoubleDoorParams {
  totalWidth: number;
  height: number;
  activeLeaf: string;
}

interface DoubleDoorInputs {
  position: [number, number, number];
}

interface DoubleDoorOutputs {
  doors: unknown;
  frame: unknown;
}

export const ArchitectureDoorsDoubleDoorNode: NodeDefinition<
  DoubleDoorInputs,
  DoubleDoorOutputs,
  DoubleDoorParams
> = {
  id: 'Architecture::DoubleDoor',
  type: 'Architecture::DoubleDoor',
  category: 'Architecture',
  label: 'DoubleDoor',
  description: 'Double swing door',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    doors: {
      type: 'Shape[]',
      label: 'Doors',
    },
    frame: {
      type: 'Shape',
      label: 'Frame',
    },
  },
  params: {
    totalWidth: {
      type: 'number',
      label: 'Total Width',
      default: 1800,
      min: 1200,
      max: 2400,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 2100,
      min: 1800,
      max: 2400,
    },
    activeLeaf: {
      type: 'enum',
      label: 'Active Leaf',
      default: 'both',
      options: ['left', 'right', 'both'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'doubleDoor',
      params: {
        position: inputs.position,
        totalWidth: params.totalWidth,
        height: params.height,
        activeLeaf: params.activeLeaf,
      },
    });

    return {
      doors: results.doors,
      frame: results.frame,
    };
  },
};
