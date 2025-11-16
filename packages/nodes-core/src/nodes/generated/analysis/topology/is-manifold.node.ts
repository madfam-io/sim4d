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
  isManifold: boolean;
  nonManifoldEdges: Edge[];
  nonManifoldVertices: Vertex[];
}

export const IsManifoldNode: NodeDefinition<IsManifoldInputs, IsManifoldOutputs, IsManifoldParams> =
  {
    type: 'Analysis::IsManifold',
    category: 'Analysis',
    subcategory: 'Topology',

    metadata: {
      label: 'IsManifold',
      description: 'Check if shape is manifold',
    },

    params: {},

    inputs: {
      shape: 'Shape',
    },

    outputs: {
      isManifold: 'boolean',
      nonManifoldEdges: 'Edge[]',
      nonManifoldVertices: 'Vertex[]',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'checkManifold',
        params: {
          shape: inputs.shape,
        },
      });

      return {
        isManifold: result,
        nonManifoldEdges: result,
        nonManifoldVertices: result,
      };
    },
  };
