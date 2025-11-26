import type { NodeDefinition } from '@sim4d/types';

interface VaultedCeilingParams {
  vaultType: string;
  rise: number;
}

interface VaultedCeilingInputs {
  ceilingOutline: unknown;
}

interface VaultedCeilingOutputs {
  vaultedCeiling: unknown;
}

export const ArchitectureCeilingsVaultedCeilingNode: NodeDefinition<
  VaultedCeilingInputs,
  VaultedCeilingOutputs,
  VaultedCeilingParams
> = {
  id: 'Architecture::VaultedCeiling',
  type: 'Architecture::VaultedCeiling',
  category: 'Architecture',
  label: 'VaultedCeiling',
  description: 'Vaulted ceiling geometry',
  inputs: {
    ceilingOutline: {
      type: 'Wire',
      label: 'Ceiling Outline',
      required: true,
    },
  },
  outputs: {
    vaultedCeiling: {
      type: 'Shape',
      label: 'Vaulted Ceiling',
    },
  },
  params: {
    vaultType: {
      type: 'enum',
      label: 'Vault Type',
      default: 'barrel',
      options: ['barrel', 'groin', 'cloister', 'dome'],
    },
    rise: {
      type: 'number',
      label: 'Rise',
      default: 1000,
      min: 500,
      max: 3000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'vaultedCeiling',
      params: {
        ceilingOutline: inputs.ceilingOutline,
        vaultType: params.vaultType,
        rise: params.rise,
      },
    });

    return {
      vaultedCeiling: result,
    };
  },
};
