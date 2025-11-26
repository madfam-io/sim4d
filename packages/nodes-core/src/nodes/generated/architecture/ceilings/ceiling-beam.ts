import type { NodeDefinition } from '@sim4d/types';

interface CeilingBeamParams {
  beamDepth: number;
  beamWidth: number;
  spacing: number;
}

interface CeilingBeamInputs {
  ceilingArea: unknown;
}

interface CeilingBeamOutputs {
  beams: unknown;
}

export const ArchitectureCeilingsCeilingBeamNode: NodeDefinition<
  CeilingBeamInputs,
  CeilingBeamOutputs,
  CeilingBeamParams
> = {
  id: 'Architecture::CeilingBeam',
  type: 'Architecture::CeilingBeam',
  category: 'Architecture',
  label: 'CeilingBeam',
  description: 'Exposed ceiling beams',
  inputs: {
    ceilingArea: {
      type: 'Face',
      label: 'Ceiling Area',
      required: true,
    },
  },
  outputs: {
    beams: {
      type: 'Shape[]',
      label: 'Beams',
    },
  },
  params: {
    beamDepth: {
      type: 'number',
      label: 'Beam Depth',
      default: 300,
      min: 200,
      max: 600,
    },
    beamWidth: {
      type: 'number',
      label: 'Beam Width',
      default: 150,
      min: 100,
      max: 300,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 1200,
      min: 600,
      max: 2400,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'ceilingBeam',
      params: {
        ceilingArea: inputs.ceilingArea,
        beamDepth: params.beamDepth,
        beamWidth: params.beamWidth,
        spacing: params.spacing,
      },
    });

    return {
      beams: result,
    };
  },
};
