import type { NodeDefinition } from '@sim4d/types';

interface WoodJoistFloorParams {
  joistDepth: number;
  joistSpacing: number;
  subfloorThickness: number;
}

interface WoodJoistFloorInputs {
  floorBoundary: unknown;
}

interface WoodJoistFloorOutputs {
  floorSystem: unknown;
  joists: unknown;
}

export const ArchitectureFloorsWoodJoistFloorNode: NodeDefinition<
  WoodJoistFloorInputs,
  WoodJoistFloorOutputs,
  WoodJoistFloorParams
> = {
  id: 'Architecture::WoodJoistFloor',
  category: 'Architecture',
  label: 'WoodJoistFloor',
  description: 'Wood joist floor system',
  inputs: {
    floorBoundary: {
      type: 'Wire',
      label: 'Floor Boundary',
      required: true,
    },
  },
  outputs: {
    floorSystem: {
      type: 'Shape',
      label: 'Floor System',
    },
    joists: {
      type: 'Shape[]',
      label: 'Joists',
    },
  },
  params: {
    joistDepth: {
      type: 'number',
      label: 'Joist Depth',
      default: 250,
      min: 150,
      max: 400,
    },
    joistSpacing: {
      type: 'number',
      label: 'Joist Spacing',
      default: 400,
      min: 300,
      max: 600,
    },
    subfloorThickness: {
      type: 'number',
      label: 'Subfloor Thickness',
      default: 18,
      min: 15,
      max: 25,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'woodJoistFloor',
      params: {
        floorBoundary: inputs.floorBoundary,
        joistDepth: params.joistDepth,
        joistSpacing: params.joistSpacing,
        subfloorThickness: params.subfloorThickness,
      },
    });

    return {
      floorSystem: results.floorSystem,
      joists: results.joists,
    };
  },
};
