import type { NodeDefinition } from '@sim4d/types';

interface SectionCurvesParams {
  planeNormal: [number, number, number];
  spacing: number;
  count: number;
}

interface SectionCurvesInputs {
  shape: unknown;
}

interface SectionCurvesOutputs {
  sections: unknown;
}

export const SurfaceAnalysisSectionCurvesNode: NodeDefinition<
  SectionCurvesInputs,
  SectionCurvesOutputs,
  SectionCurvesParams
> = {
  id: 'Surface::SectionCurves',
  category: 'Surface',
  label: 'SectionCurves',
  description: 'Extract section curves',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    sections: {
      type: 'Wire[]',
      label: 'Sections',
    },
  },
  params: {
    planeNormal: {
      type: 'vec3',
      label: 'Plane Normal',
      default: [0, 0, 1],
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    count: {
      type: 'number',
      label: 'Count',
      default: 10,
      min: 1,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sectionCurves',
      params: {
        shape: inputs.shape,
        planeNormal: params.planeNormal,
        spacing: params.spacing,
        count: params.count,
      },
    });

    return {
      sections: result,
    };
  },
};
