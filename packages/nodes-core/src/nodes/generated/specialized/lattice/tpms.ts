import type { NodeDefinition } from '@brepflow/types';

interface TPMSParams {
  type: string;
  period: number;
  thickness: number;
  level: number;
}

interface TPMSInputs {
  boundingBox: unknown;
}

interface TPMSOutputs {
  tpms: unknown;
}

export const SpecializedLatticeTPMSNode: NodeDefinition<TPMSInputs, TPMSOutputs, TPMSParams> = {
  id: 'Specialized::TPMS',
  type: 'Specialized::TPMS',
  category: 'Specialized',
  label: 'TPMS',
  description: 'Triply periodic minimal surface',
  inputs: {
    boundingBox: {
      type: 'Shape',
      label: 'Bounding Box',
      required: true,
    },
  },
  outputs: {
    tpms: {
      type: 'Shape',
      label: 'Tpms',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'gyroid',
      options: ['gyroid', 'schwarz-p', 'schwarz-d', 'neovius', 'lidinoid'],
    },
    period: {
      type: 'number',
      label: 'Period',
      default: 20,
      min: 1,
      max: 200,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 1,
      min: 0.1,
      max: 10,
    },
    level: {
      type: 'number',
      label: 'Level',
      default: 0,
      min: -1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'tpms',
      params: {
        boundingBox: inputs.boundingBox,
        type: params.type,
        period: params.period,
        thickness: params.thickness,
        level: params.level,
      },
    });

    return {
      tpms: result,
    };
  },
};
