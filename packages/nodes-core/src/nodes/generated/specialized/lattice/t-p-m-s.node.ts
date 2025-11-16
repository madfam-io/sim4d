import { NodeDefinition } from '@brepflow/types';

interface Params {
  type: string;
  period: number;
  thickness: number;
  level: number;
}
interface Inputs {
  boundingBox: Shape;
}
interface Outputs {
  tpms: Shape;
}

export const TPMSNode: NodeDefinition<TPMSInputs, TPMSOutputs, TPMSParams> = {
  type: 'Specialized::TPMS',
  category: 'Specialized',
  subcategory: 'Lattice',

  metadata: {
    label: 'TPMS',
    description: 'Triply periodic minimal surface',
  },

  params: {
    type: {
      default: 'gyroid',
      options: ['gyroid', 'schwarz-p', 'schwarz-d', 'neovius', 'lidinoid'],
    },
    period: {
      default: 20,
      min: 1,
      max: 200,
    },
    thickness: {
      default: 1,
      min: 0.1,
      max: 10,
    },
    level: {
      default: 0,
      min: -1,
      max: 1,
    },
  },

  inputs: {
    boundingBox: 'Shape',
  },

  outputs: {
    tpms: 'Shape',
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
