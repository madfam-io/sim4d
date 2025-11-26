import type { NodeDefinition } from '@sim4d/types';

interface ClearanceCheckParams {
  requiredClearance: number;
  highlightViolations: boolean;
}

interface ClearanceCheckInputs {
  movingObject: unknown;
  obstacles: unknown;
}

interface ClearanceCheckOutputs {
  hasViolations: unknown;
  violationPoints: Array<[number, number, number]>;
  clearanceValues: unknown;
}

export const AnalysisProximityClearanceCheckNode: NodeDefinition<
  ClearanceCheckInputs,
  ClearanceCheckOutputs,
  ClearanceCheckParams
> = {
  id: 'Analysis::ClearanceCheck',
  type: 'Analysis::ClearanceCheck',
  category: 'Analysis',
  label: 'ClearanceCheck',
  description: 'Check clearance requirements',
  inputs: {
    movingObject: {
      type: 'Shape',
      label: 'Moving Object',
      required: true,
    },
    obstacles: {
      type: 'Shape[]',
      label: 'Obstacles',
      required: true,
    },
  },
  outputs: {
    hasViolations: {
      type: 'boolean',
      label: 'Has Violations',
    },
    violationPoints: {
      type: 'Point[]',
      label: 'Violation Points',
    },
    clearanceValues: {
      type: 'number[]',
      label: 'Clearance Values',
    },
  },
  params: {
    requiredClearance: {
      type: 'number',
      label: 'Required Clearance',
      default: 5,
      min: 0.1,
      max: 100,
    },
    highlightViolations: {
      type: 'boolean',
      label: 'Highlight Violations',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'clearanceCheck',
      params: {
        movingObject: inputs.movingObject,
        obstacles: inputs.obstacles,
        requiredClearance: params.requiredClearance,
        highlightViolations: params.highlightViolations,
      },
    });

    return {
      hasViolations: results.hasViolations,
      violationPoints: results.violationPoints,
      clearanceValues: results.clearanceValues,
    };
  },
};
