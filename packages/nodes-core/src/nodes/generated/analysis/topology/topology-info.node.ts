import { NodeDefinition } from '@brepflow/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

type Params = {};
interface Inputs {
  shape: Shape;
}
interface Outputs {
  vertices: number;
  edges: number;
  faces: number;
  shells: number;
  solids: number;
}

export const TopologyInfoNode: NodeDefinition<
  TopologyInfoInputs,
  TopologyInfoOutputs,
  TopologyInfoParams
> = {
  type: 'Analysis::TopologyInfo',
  category: 'Analysis',
  subcategory: 'Topology',

  metadata: {
    label: 'TopologyInfo',
    description: 'Get topology information',
  },

  params: {},

  inputs: {
    shape: 'Shape',
  },

  outputs: {
    vertices: 'number',
    edges: 'number',
    faces: 'number',
    shells: 'number',
    solids: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'getTopologyInfo',
      params: {
        shape: inputs.shape,
      },
    });

    return {
      vertices: result,
      edges: result,
      faces: result,
      shells: result,
      solids: result,
    };
  },
};
