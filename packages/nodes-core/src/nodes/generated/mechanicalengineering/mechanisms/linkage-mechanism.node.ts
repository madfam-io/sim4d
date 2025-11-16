import type { NodeDefinition } from '@brepflow/types';

interface LinkageMechanismParams {
  type: string;
  linkLength1: number;
  linkLength2: number;
  linkLength3: number;
  angle: number;
}

interface LinkageMechanismInputs {
  basePoints: Array<[number, number, number]>;
}

interface LinkageMechanismOutputs {
  mechanism: unknown;
  links: unknown;
  joints: Array<[number, number, number]>;
}

export const MechanicalEngineeringMechanismsLinkageMechanismNode: NodeDefinition<
  LinkageMechanismInputs,
  LinkageMechanismOutputs,
  LinkageMechanismParams
> = {
  id: 'MechanicalEngineering::LinkageMechanism',
  category: 'MechanicalEngineering',
  label: 'LinkageMechanism',
  description: 'Create linkage mechanism',
  inputs: {
    basePoints: {
      type: 'Point[]',
      label: 'Base Points',
      required: true,
    },
  },
  outputs: {
    mechanism: {
      type: 'Shape',
      label: 'Mechanism',
    },
    links: {
      type: 'Shape[]',
      label: 'Links',
    },
    joints: {
      type: 'Point[]',
      label: 'Joints',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'four-bar',
      options: ['four-bar', 'slider-crank', 'scotch-yoke', 'geneva'],
    },
    linkLength1: {
      type: 'number',
      label: 'Link Length1',
      default: 50,
      min: 10,
      max: 200,
    },
    linkLength2: {
      type: 'number',
      label: 'Link Length2',
      default: 80,
      min: 10,
      max: 200,
    },
    linkLength3: {
      type: 'number',
      label: 'Link Length3',
      default: 60,
      min: 10,
      max: 200,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 0,
      min: 0,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'linkageMechanism',
      params: {
        basePoints: inputs.basePoints,
        type: params.type,
        linkLength1: params.linkLength1,
        linkLength2: params.linkLength2,
        linkLength3: params.linkLength3,
        angle: params.angle,
      },
    });

    return {
      mechanism: results.mechanism,
      links: results.links,
      joints: results.joints,
    };
  },
};
