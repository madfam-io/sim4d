import type { NodeDefinition } from '@sim4d/types';

interface CurvatureCombParams {
  scale: number;
  density: number;
  showNormals: boolean;
  colorCode: boolean;
}

interface CurvatureCombInputs {
  curve: unknown;
}

interface CurvatureCombOutputs {
  comb: unknown;
  maxCurvature: unknown;
  minCurvature: unknown;
  curvatureValues: unknown;
}

export const AnalysisCurvesCurvatureCombNode: NodeDefinition<
  CurvatureCombInputs,
  CurvatureCombOutputs,
  CurvatureCombParams
> = {
  id: 'Analysis::CurvatureComb',
  category: 'Analysis',
  label: 'CurvatureComb',
  description: 'Analyze curve curvature with visual comb',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    comb: {
      type: 'Shape',
      label: 'Comb',
    },
    maxCurvature: {
      type: 'number',
      label: 'Max Curvature',
    },
    minCurvature: {
      type: 'number',
      label: 'Min Curvature',
    },
    curvatureValues: {
      type: 'number[]',
      label: 'Curvature Values',
    },
  },
  params: {
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1,
      min: 0.1,
      max: 10,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 50,
      min: 10,
      max: 200,
    },
    showNormals: {
      type: 'boolean',
      label: 'Show Normals',
      default: true,
    },
    colorCode: {
      type: 'boolean',
      label: 'Color Code',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curvatureComb',
      params: {
        curve: inputs.curve,
        scale: params.scale,
        density: params.density,
        showNormals: params.showNormals,
        colorCode: params.colorCode,
      },
    });

    return {
      comb: results.comb,
      maxCurvature: results.maxCurvature,
      minCurvature: results.minCurvature,
      curvatureValues: results.curvatureValues,
    };
  },
};
