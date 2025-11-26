import type { NodeDefinition } from '@sim4d/types';

interface AcousticCeilingParams {
  nrc: number;
  panelType: string;
}

interface AcousticCeilingInputs {
  ceilingArea: unknown;
}

interface AcousticCeilingOutputs {
  acousticCeiling: unknown;
}

export const ArchitectureCeilingsAcousticCeilingNode: NodeDefinition<
  AcousticCeilingInputs,
  AcousticCeilingOutputs,
  AcousticCeilingParams
> = {
  id: 'Architecture::AcousticCeiling',
  type: 'Architecture::AcousticCeiling',
  category: 'Architecture',
  label: 'AcousticCeiling',
  description: 'Acoustic ceiling treatment',
  inputs: {
    ceilingArea: {
      type: 'Face',
      label: 'Ceiling Area',
      required: true,
    },
  },
  outputs: {
    acousticCeiling: {
      type: 'Shape',
      label: 'Acoustic Ceiling',
    },
  },
  params: {
    nrc: {
      type: 'number',
      label: 'Nrc',
      default: 0.85,
      min: 0.5,
      max: 1,
    },
    panelType: {
      type: 'enum',
      label: 'Panel Type',
      default: 'tiles',
      options: ['perforated', 'baffles', 'clouds', 'tiles'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'acousticCeiling',
      params: {
        ceilingArea: inputs.ceilingArea,
        nrc: params.nrc,
        panelType: params.panelType,
      },
    });

    return {
      acousticCeiling: result,
    };
  },
};
