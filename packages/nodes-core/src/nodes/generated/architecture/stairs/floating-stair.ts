import type { NodeDefinition } from '@brepflow/types';

interface FloatingStairParams {
  cantileverDepth: number;
  treadThickness: number;
}

interface FloatingStairInputs {
  wallLine: unknown;
  riseRun: [number, number, number];
}

interface FloatingStairOutputs {
  floatingStair: unknown;
  anchors: Array<[number, number, number]>;
}

export const ArchitectureStairsFloatingStairNode: NodeDefinition<
  FloatingStairInputs,
  FloatingStairOutputs,
  FloatingStairParams
> = {
  id: 'Architecture::FloatingStair',
  type: 'Architecture::FloatingStair',
  category: 'Architecture',
  label: 'FloatingStair',
  description: 'Floating cantilevered stairs',
  inputs: {
    wallLine: {
      type: 'Wire',
      label: 'Wall Line',
      required: true,
    },
    riseRun: {
      type: 'Vector',
      label: 'Rise Run',
      required: true,
    },
  },
  outputs: {
    floatingStair: {
      type: 'Shape',
      label: 'Floating Stair',
    },
    anchors: {
      type: 'Point[]',
      label: 'Anchors',
    },
  },
  params: {
    cantileverDepth: {
      type: 'number',
      label: 'Cantilever Depth',
      default: 100,
      min: 50,
      max: 200,
    },
    treadThickness: {
      type: 'number',
      label: 'Tread Thickness',
      default: 60,
      min: 40,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'floatingStair',
      params: {
        wallLine: inputs.wallLine,
        riseRun: inputs.riseRun,
        cantileverDepth: params.cantileverDepth,
        treadThickness: params.treadThickness,
      },
    });

    return {
      floatingStair: results.floatingStair,
      anchors: results.anchors,
    };
  },
};
