import type { NodeDefinition } from '@sim4d/types';

interface MezzanineFloorParams {
  structureType: string;
  clearHeight: number;
}

interface MezzanineFloorInputs {
  mezzanineOutline: unknown;
}

interface MezzanineFloorOutputs {
  mezzanine: unknown;
  structure: unknown;
}

export const ArchitectureFloorsMezzanineFloorNode: NodeDefinition<
  MezzanineFloorInputs,
  MezzanineFloorOutputs,
  MezzanineFloorParams
> = {
  id: 'Architecture::MezzanineFloor',
  type: 'Architecture::MezzanineFloor',
  category: 'Architecture',
  label: 'MezzanineFloor',
  description: 'Mezzanine floor structure',
  inputs: {
    mezzanineOutline: {
      type: 'Wire',
      label: 'Mezzanine Outline',
      required: true,
    },
  },
  outputs: {
    mezzanine: {
      type: 'Shape',
      label: 'Mezzanine',
    },
    structure: {
      type: 'Shape[]',
      label: 'Structure',
    },
  },
  params: {
    structureType: {
      type: 'enum',
      label: 'Structure Type',
      default: 'steel',
      options: ['steel', 'concrete', 'wood'],
    },
    clearHeight: {
      type: 'number',
      label: 'Clear Height',
      default: 2400,
      min: 2100,
      max: 3000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mezzanineFloor',
      params: {
        mezzanineOutline: inputs.mezzanineOutline,
        structureType: params.structureType,
        clearHeight: params.clearHeight,
      },
    });

    return {
      mezzanine: results.mezzanine,
      structure: results.structure,
    };
  },
};
