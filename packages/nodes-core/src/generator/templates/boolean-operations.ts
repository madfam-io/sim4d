/**
 * Boolean Operations Templates - Phase 2
 * Fundamental CSG operations for combining solids
 */

import { NodeTemplate } from '../node-template';

/**
 * Boolean Operations - Core CAD operations
 */
export const booleanOperationTemplates: NodeTemplate[] = [
  {
    category: 'Boolean',
    name: 'Union',
    description: 'Combine multiple shapes into one',
    operation: 'BOOLEAN_UNION',
    occtBinding: 'booleanUnion',
    parameters: [
      {
        name: 'keepOriginals',
        type: 'boolean',
        default: false,
        description: 'Keep original shapes',
      },
      {
        name: 'fuzzyValue',
        type: 'number',
        default: 1e-7,
        min: 0,
        max: 1,
        description: 'Tolerance for fuzzy boolean',
      },
    ],
    inputs: [{ name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to unite' }],
    outputs: [{ name: 'result', type: 'Shape', description: 'United shape' }],
    examples: [
      {
        title: 'Simple Union',
        parameters: { keepOriginals: false },
      },
    ],
  },

  {
    category: 'Boolean',
    name: 'Difference',
    description: 'Subtract tool shapes from base shape',
    operation: 'BOOLEAN_DIFFERENCE',
    occtBinding: 'booleanDifference',
    parameters: [
      { name: 'keepOriginals', type: 'boolean', default: false },
      { name: 'fuzzyValue', type: 'number', default: 1e-7, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'base', type: 'Shape', required: true, description: 'Base shape' },
      { name: 'tools', type: 'Shape[]', required: true, description: 'Shapes to subtract' },
    ],
    outputs: [{ name: 'result', type: 'Shape', description: 'Difference result' }],
  },

  {
    category: 'Boolean',
    name: 'Intersection',
    description: 'Keep only overlapping regions',
    operation: 'BOOLEAN_INTERSECTION',
    occtBinding: 'booleanIntersection',
    parameters: [
      { name: 'keepOriginals', type: 'boolean', default: false },
      { name: 'fuzzyValue', type: 'number', default: 1e-7, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to intersect' },
    ],
    outputs: [{ name: 'result', type: 'Shape', description: 'Intersection result' }],
  },

  {
    category: 'Boolean',
    name: 'XOR',
    description: 'Exclusive OR - keep non-overlapping regions',
    operation: 'BOOLEAN_XOR',
    occtBinding: 'booleanXOR',
    parameters: [
      { name: 'keepOriginals', type: 'boolean', default: false },
      { name: 'fuzzyValue', type: 'number', default: 1e-7, min: 0, max: 1 },
    ],
    inputs: [{ name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes for XOR' }],
    outputs: [{ name: 'result', type: 'Shape', description: 'XOR result' }],
  },

  {
    category: 'Boolean',
    name: 'Split',
    description: 'Split shapes by each other',
    operation: 'BOOLEAN_SPLIT',
    occtBinding: 'booleanSplit',
    parameters: [
      { name: 'keepAll', type: 'boolean', default: true, description: 'Keep all fragments' },
    ],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to split' },
      { name: 'tools', type: 'Shape[]', required: true, description: 'Splitting tools' },
    ],
    outputs: [{ name: 'fragments', type: 'Shape[]', description: 'Split fragments' }],
  },

  {
    category: 'Boolean',
    name: 'Fragment',
    description: 'Fragment all shapes by each other',
    operation: 'BOOLEAN_FRAGMENT',
    occtBinding: 'booleanFragment',
    parameters: [],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to fragment' },
    ],
    outputs: [{ name: 'fragments', type: 'Shape[]', description: 'All fragments' }],
  },

  {
    category: 'Boolean',
    name: 'CommonEdges',
    description: 'Extract common edges between shapes',
    operation: 'BOOLEAN_COMMON_EDGES',
    occtBinding: 'booleanCommonEdges',
    parameters: [],
    inputs: [
      { name: 'shape1', type: 'Shape', required: true },
      { name: 'shape2', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'edges', type: 'Edge[]', description: 'Common edges' }],
  },

  {
    category: 'Boolean',
    name: 'Imprint',
    description: 'Imprint one shape onto another',
    operation: 'BOOLEAN_IMPRINT',
    occtBinding: 'booleanImprint',
    parameters: [
      {
        name: 'depth',
        type: 'number',
        default: 1,
        min: 0.01,
        max: 1000,
        description: 'Imprint depth',
      },
    ],
    inputs: [
      { name: 'base', type: 'Shape', required: true, description: 'Base shape' },
      { name: 'imprint', type: 'Shape', required: true, description: 'Shape to imprint' },
    ],
    outputs: [{ name: 'result', type: 'Shape', description: 'Imprinted shape' }],
  },

  {
    category: 'Boolean',
    name: 'Glue',
    description: 'Glue shapes together at common faces',
    operation: 'BOOLEAN_GLUE',
    occtBinding: 'booleanGlue',
    parameters: [{ name: 'tolerance', type: 'number', default: 1e-7, min: 0, max: 1 }],
    inputs: [{ name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to glue' }],
    outputs: [{ name: 'result', type: 'Shape', description: 'Glued shape' }],
  },

  {
    category: 'Boolean',
    name: 'Compound',
    description: 'Create a compound from multiple shapes',
    operation: 'MAKE_COMPOUND',
    occtBinding: 'makeCompound',
    parameters: [],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to compound' },
    ],
    outputs: [{ name: 'compound', type: 'Compound', description: 'Compound shape' }],
  },
];

// Export all templates
export const allBooleanTemplates = [...booleanOperationTemplates];
