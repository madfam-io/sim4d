import type { NodeDefinition } from '@brepflow/types';

interface SecurityDoorParams {
  level: string;
  accessControl: string;
}

interface SecurityDoorInputs {
  opening: unknown;
}

interface SecurityDoorOutputs {
  securityDoor: unknown;
}

export const ArchitectureDoorsSecurityDoorNode: NodeDefinition<
  SecurityDoorInputs,
  SecurityDoorOutputs,
  SecurityDoorParams
> = {
  id: 'Architecture::SecurityDoor',
  type: 'Architecture::SecurityDoor',
  category: 'Architecture',
  label: 'SecurityDoor',
  description: 'Security door system',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    securityDoor: {
      type: 'Shape',
      label: 'Security Door',
    },
  },
  params: {
    level: {
      type: 'enum',
      label: 'Level',
      default: 'high',
      options: ['standard', 'high', 'maximum'],
    },
    accessControl: {
      type: 'enum',
      label: 'Access Control',
      default: 'card',
      options: ['key', 'code', 'card', 'biometric'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'securityDoor',
      params: {
        opening: inputs.opening,
        level: params.level,
        accessControl: params.accessControl,
      },
    });

    return {
      securityDoor: result,
    };
  },
};
