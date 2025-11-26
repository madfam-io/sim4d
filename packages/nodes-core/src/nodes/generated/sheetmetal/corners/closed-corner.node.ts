import type { NodeDefinition } from '@sim4d/types';

interface ClosedCornerParams {
  cornerType: string;
  gapDistance: number;
  overlapRatio: number;
}

interface ClosedCornerInputs {
  sheet: unknown;
  faces: unknown;
}

interface ClosedCornerOutputs {
  result: unknown;
}

export const SheetMetalCornersClosedCornerNode: NodeDefinition<
  ClosedCornerInputs,
  ClosedCornerOutputs,
  ClosedCornerParams
> = {
  id: 'SheetMetal::ClosedCorner',
  category: 'SheetMetal',
  label: 'ClosedCorner',
  description: 'Create closed corner',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    faces: {
      type: 'Face[]',
      label: 'Faces',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    cornerType: {
      type: 'enum',
      label: 'Corner Type',
      default: 'overlap',
      options: ['overlap', 'underlap', 'butt'],
    },
    gapDistance: {
      type: 'number',
      label: 'Gap Distance',
      default: 0,
      min: 0,
      max: 10,
    },
    overlapRatio: {
      type: 'number',
      label: 'Overlap Ratio',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetClosedCorner',
      params: {
        sheet: inputs.sheet,
        faces: inputs.faces,
        cornerType: params.cornerType,
        gapDistance: params.gapDistance,
        overlapRatio: params.overlapRatio,
      },
    });

    return {
      result: result,
    };
  },
};
