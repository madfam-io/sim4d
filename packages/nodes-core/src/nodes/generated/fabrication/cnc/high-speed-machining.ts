import type { NodeDefinition } from '@brepflow/types';

interface HighSpeedMachiningParams {
  cornerRadius: number;
  entrySpeed: number;
}

interface HighSpeedMachiningInputs {
  toolpath: unknown;
}

interface HighSpeedMachiningOutputs {
  hsmPath: unknown;
}

export const FabricationCNCHighSpeedMachiningNode: NodeDefinition<
  HighSpeedMachiningInputs,
  HighSpeedMachiningOutputs,
  HighSpeedMachiningParams
> = {
  id: 'Fabrication::HighSpeedMachining',
  type: 'Fabrication::HighSpeedMachining',
  category: 'Fabrication',
  label: 'HighSpeedMachining',
  description: 'HSM toolpath optimization',
  inputs: {
    toolpath: {
      type: 'Wire[]',
      label: 'Toolpath',
      required: true,
    },
  },
  outputs: {
    hsmPath: {
      type: 'Wire[]',
      label: 'Hsm Path',
    },
  },
  params: {
    cornerRadius: {
      type: 'number',
      label: 'Corner Radius',
      default: 2,
      min: 0.1,
      max: 10,
    },
    entrySpeed: {
      type: 'number',
      label: 'Entry Speed',
      default: 0.5,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'highSpeedMachining',
      params: {
        toolpath: inputs.toolpath,
        cornerRadius: params.cornerRadius,
        entrySpeed: params.entrySpeed,
      },
    });

    return {
      hsmPath: result,
    };
  },
};
