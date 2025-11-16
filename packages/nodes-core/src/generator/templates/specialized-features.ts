/**
 * Specialized Features Templates - Phase 9
 * Text, engraving, lattice structures, topology optimization, organic forms
 */

import { NodeTemplate } from '../node-template';

/**
 * Text and Engraving
 */
export const textEngravingTemplates: NodeTemplate[] = [
  {
    category: 'Specialized',
    subcategory: 'Text',
    name: 'Text3D',
    description: 'Create 3D text',
    operation: 'TEXT_3D',
    occtBinding: 'text3D',
    parameters: [
      { name: 'text', type: 'string', default: 'HELLO' },
      {
        name: 'font',
        type: 'enum',
        options: ['Arial', 'Helvetica', 'Times', 'Courier'],
        default: 'Arial',
      },
      { name: 'size', type: 'number', default: 20, min: 1, max: 1000 },
      { name: 'height', type: 'number', default: 5, min: 0.1, max: 1000 },
      { name: 'bold', type: 'boolean', default: false },
      { name: 'italic', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'position', type: 'Point', required: false },
      { name: 'direction', type: 'Vector', required: false },
    ],
    outputs: [{ name: 'text', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Text',
    name: 'Engrave',
    description: 'Engrave text or pattern',
    operation: 'ENGRAVE',
    occtBinding: 'engrave',
    parameters: [
      { name: 'depth', type: 'number', default: 1, min: 0.01, max: 100 },
      { name: 'angle', type: 'number', default: 45, min: 0, max: 90, description: 'Draft angle' },
      { name: 'roundCorners', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'targetFace', type: 'Face', required: true },
      { name: 'pattern', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'engraved', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Text',
    name: 'Emboss',
    description: 'Emboss text or pattern',
    operation: 'EMBOSS',
    occtBinding: 'emboss',
    parameters: [
      { name: 'height', type: 'number', default: 1, min: 0.01, max: 100 },
      { name: 'angle', type: 'number', default: 45, min: 0, max: 90 },
      { name: 'roundEdges', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'targetFace', type: 'Face', required: true },
      { name: 'pattern', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'embossed', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Text',
    name: 'SerialNumber',
    description: 'Generate serial numbers',
    operation: 'SERIAL_NUMBER',
    occtBinding: 'serialNumber',
    parameters: [
      { name: 'prefix', type: 'string', default: 'SN' },
      { name: 'startNumber', type: 'number', default: 1, min: 0, max: 999999, step: 1 },
      { name: 'digits', type: 'number', default: 6, min: 1, max: 10, step: 1 },
      { name: 'increment', type: 'number', default: 1, min: 1, max: 100, step: 1 },
    ],
    inputs: [{ name: 'count', type: 'number', required: true }],
    outputs: [{ name: 'serials', type: 'string[]' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Text',
    name: 'Barcode',
    description: 'Generate barcode geometry',
    operation: 'BARCODE',
    occtBinding: 'barcode',
    parameters: [
      { name: 'type', type: 'enum', options: ['QR', 'Code128', 'Code39', 'EAN13'], default: 'QR' },
      { name: 'data', type: 'string', default: '123456789' },
      { name: 'size', type: 'number', default: 20, min: 5, max: 200 },
      { name: 'height', type: 'number', default: 0.5, min: 0.01, max: 10 },
    ],
    inputs: [],
    outputs: [{ name: 'barcode', type: 'Shape' }],
  },
];

/**
 * Lattice Structures
 */
export const latticeTemplates: NodeTemplate[] = [
  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'LatticeStructure',
    description: 'Create lattice structure',
    operation: 'LATTICE_STRUCTURE',
    occtBinding: 'latticeStructure',
    parameters: [
      {
        name: 'cellType',
        type: 'enum',
        options: ['cubic', 'gyroid', 'diamond', 'schwarz', 'bcc', 'fcc'],
        default: 'cubic',
      },
      { name: 'cellSize', type: 'number', default: 10, min: 0.1, max: 100 },
      { name: 'strutDiameter', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'porosity', type: 'number', default: 0.7, min: 0.1, max: 0.95 },
    ],
    inputs: [{ name: 'boundingShape', type: 'Shape', required: true }],
    outputs: [{ name: 'lattice', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'TPMS',
    description: 'Triply periodic minimal surface',
    operation: 'TPMS',
    occtBinding: 'tpms',
    parameters: [
      {
        name: 'type',
        type: 'enum',
        options: ['gyroid', 'schwarz-p', 'schwarz-d', 'neovius', 'lidinoid'],
        default: 'gyroid',
      },
      { name: 'period', type: 'number', default: 20, min: 1, max: 200 },
      { name: 'thickness', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'level', type: 'number', default: 0, min: -1, max: 1 },
    ],
    inputs: [{ name: 'boundingBox', type: 'Shape', required: true }],
    outputs: [{ name: 'tpms', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'VoronoiLattice',
    description: 'Voronoi-based lattice',
    operation: 'VORONOI_LATTICE',
    occtBinding: 'voronoiLattice',
    parameters: [
      { name: 'seedCount', type: 'number', default: 100, min: 10, max: 10000, step: 10 },
      { name: 'strutDiameter', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'randomSeed', type: 'number', default: 42, min: 0, max: 999999, step: 1 },
    ],
    inputs: [
      { name: 'boundingShape', type: 'Shape', required: true },
      { name: 'seedPoints', type: 'Point[]', required: false },
    ],
    outputs: [{ name: 'voronoi', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'GradedLattice',
    description: 'Density-graded lattice',
    operation: 'GRADED_LATTICE',
    occtBinding: 'gradedLattice',
    parameters: [
      { name: 'minDensity', type: 'number', default: 0.2, min: 0.1, max: 0.9 },
      { name: 'maxDensity', type: 'number', default: 0.8, min: 0.2, max: 0.95 },
      {
        name: 'gradientType',
        type: 'enum',
        options: ['linear', 'radial', 'field'],
        default: 'linear',
      },
    ],
    inputs: [
      { name: 'boundingShape', type: 'Shape', required: true },
      { name: 'densityField', type: 'Data', required: false },
    ],
    outputs: [{ name: 'gradedLattice', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'ConformLattice',
    description: 'Conformal lattice mapping',
    operation: 'CONFORM_LATTICE',
    occtBinding: 'conformLattice',
    parameters: [
      { name: 'conformType', type: 'enum', options: ['surface', 'volume'], default: 'volume' },
      { name: 'cellSize', type: 'number', default: 10, min: 1, max: 100 },
    ],
    inputs: [
      { name: 'targetShape', type: 'Shape', required: true },
      { name: 'latticePattern', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'conformed', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Lattice',
    name: 'HoneycombStructure',
    description: 'Honeycomb infill structure',
    operation: 'HONEYCOMB_STRUCTURE',
    occtBinding: 'honeycombStructure',
    parameters: [
      { name: 'cellSize', type: 'number', default: 5, min: 0.5, max: 50 },
      { name: 'wallThickness', type: 'number', default: 0.5, min: 0.1, max: 5 },
      { name: 'fillDensity', type: 'number', default: 0.3, min: 0.1, max: 0.9 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'honeycomb', type: 'Shape' }],
  },
];

/**
 * Topology Optimization
 */
export const topologyOptimizationTemplates: NodeTemplate[] = [
  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'TopologyOptimize',
    description: 'Topology optimization',
    operation: 'TOPOLOGY_OPTIMIZE',
    occtBinding: 'topologyOptimize',
    parameters: [
      { name: 'volumeFraction', type: 'number', default: 0.3, min: 0.1, max: 0.9 },
      { name: 'penaltyFactor', type: 'number', default: 3, min: 1, max: 5 },
      { name: 'filterRadius', type: 'number', default: 2, min: 0.5, max: 10 },
      { name: 'iterations', type: 'number', default: 100, min: 10, max: 500, step: 10 },
    ],
    inputs: [
      { name: 'designSpace', type: 'Shape', required: true },
      { name: 'loads', type: 'Data', required: true },
      { name: 'constraints', type: 'Data', required: true },
    ],
    outputs: [
      { name: 'optimized', type: 'Shape' },
      { name: 'convergence', type: 'Data' },
    ],
  },

  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'ShapeOptimize',
    description: 'Shape optimization',
    operation: 'SHAPE_OPTIMIZE',
    occtBinding: 'shapeOptimize',
    parameters: [
      {
        name: 'objective',
        type: 'enum',
        options: ['min-weight', 'max-stiffness', 'min-stress'],
        default: 'min-weight',
      },
      { name: 'morphRadius', type: 'number', default: 5, min: 0.5, max: 50 },
      { name: 'iterations', type: 'number', default: 50, min: 5, max: 200, step: 5 },
    ],
    inputs: [
      { name: 'initialShape', type: 'Shape', required: true },
      { name: 'boundaryConditions', type: 'Data', required: true },
    ],
    outputs: [{ name: 'optimized', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'GenerativeDesign',
    description: 'AI-driven generative design',
    operation: 'GENERATIVE_DESIGN',
    occtBinding: 'generativeDesign',
    parameters: [
      { name: 'objectives', type: 'string[]', default: ['weight', 'strength'] },
      { name: 'generations', type: 'number', default: 20, min: 5, max: 100, step: 5 },
      { name: 'populationSize', type: 'number', default: 50, min: 10, max: 500, step: 10 },
    ],
    inputs: [
      { name: 'designSpace', type: 'Shape', required: true },
      { name: 'requirements', type: 'Data', required: true },
    ],
    outputs: [
      { name: 'designs', type: 'Shape[]' },
      { name: 'paretoFront', type: 'Data' },
    ],
  },

  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'LightweightStructure',
    description: 'Create lightweight structure',
    operation: 'LIGHTWEIGHT_STRUCTURE',
    occtBinding: 'lightweightStructure',
    parameters: [
      { name: 'targetWeight', type: 'number', default: 0.5, min: 0.1, max: 0.9 },
      {
        name: 'structureType',
        type: 'enum',
        options: ['ribs', 'shells', 'lattice', 'hybrid'],
        default: 'hybrid',
      },
    ],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'loadPaths', type: 'Data', required: false },
    ],
    outputs: [
      { name: 'lightweighted', type: 'Shape' },
      { name: 'weightReduction', type: 'number' },
    ],
  },

  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'StressRelief',
    description: 'Add stress relief features',
    operation: 'STRESS_RELIEF',
    occtBinding: 'stressRelief',
    parameters: [
      {
        name: 'analysisType',
        type: 'enum',
        options: ['fea-based', 'geometric', 'hybrid'],
        default: 'geometric',
      },
      { name: 'reliefRadius', type: 'number', default: 2, min: 0.1, max: 20 },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'stressData', type: 'Data', required: false },
    ],
    outputs: [{ name: 'relieved', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Optimization',
    name: 'PackingOptimize',
    description: 'Optimize part packing',
    operation: 'PACKING_OPTIMIZE',
    occtBinding: 'packingOptimize',
    parameters: [
      { name: 'containerSize', type: 'vector3', default: [100, 100, 100] },
      { name: 'rotationAllowed', type: 'boolean', default: true },
      {
        name: 'algorithm',
        type: 'enum',
        options: ['greedy', 'genetic', 'simulated-annealing'],
        default: 'genetic',
      },
    ],
    inputs: [{ name: 'parts', type: 'Shape[]', required: true }],
    outputs: [
      { name: 'packing', type: 'Data' },
      { name: 'efficiency', type: 'number' },
    ],
  },
];

/**
 * Organic Forms
 */
export const organicFormTemplates: NodeTemplate[] = [
  {
    category: 'Specialized',
    subcategory: 'Organic',
    name: 'MetaBalls',
    description: 'Create metaball surfaces',
    operation: 'METABALLS',
    occtBinding: 'metaballs',
    parameters: [
      { name: 'threshold', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'resolution', type: 'number', default: 50, min: 10, max: 200, step: 5 },
    ],
    inputs: [
      { name: 'centers', type: 'Point[]', required: true },
      { name: 'radii', type: 'number[]', required: true },
    ],
    outputs: [{ name: 'metaball', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Organic',
    name: 'SubdivisionSurface',
    description: 'Subdivision surface modeling',
    operation: 'SUBDIVISION_SURFACE',
    occtBinding: 'subdivisionSurface',
    parameters: [
      {
        name: 'scheme',
        type: 'enum',
        options: ['catmull-clark', 'loop', 'doo-sabin'],
        default: 'catmull-clark',
      },
      { name: 'levels', type: 'number', default: 2, min: 1, max: 5, step: 1 },
    ],
    inputs: [{ name: 'controlMesh', type: 'Shape', required: true }],
    outputs: [{ name: 'subdivided', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Organic',
    name: 'FractalGeometry',
    description: 'Generate fractal geometry',
    operation: 'FRACTAL_GEOMETRY',
    occtBinding: 'fractalGeometry',
    parameters: [
      {
        name: 'type',
        type: 'enum',
        options: ['koch', 'sierpinski', 'menger', 'julia'],
        default: 'koch',
      },
      { name: 'iterations', type: 'number', default: 3, min: 1, max: 7, step: 1 },
      { name: 'scale', type: 'number', default: 100, min: 1, max: 1000 },
    ],
    inputs: [{ name: 'seed', type: 'Shape', required: false }],
    outputs: [{ name: 'fractal', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Organic',
    name: 'ReactionDiffusion',
    description: 'Reaction-diffusion patterns',
    operation: 'REACTION_DIFFUSION',
    occtBinding: 'reactionDiffusion',
    parameters: [
      {
        name: 'pattern',
        type: 'enum',
        options: ['spots', 'stripes', 'labyrinth', 'holes'],
        default: 'spots',
      },
      { name: 'scale', type: 'number', default: 10, min: 1, max: 100 },
      { name: 'iterations', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'pattern', type: 'Shape' }],
  },

  {
    category: 'Specialized',
    subcategory: 'Organic',
    name: 'BiomimeticStructure',
    description: 'Nature-inspired structures',
    operation: 'BIOMIMETIC_STRUCTURE',
    occtBinding: 'biomimeticStructure',
    parameters: [
      {
        name: 'inspiration',
        type: 'enum',
        options: ['bone', 'wood', 'coral', 'leaf-veins'],
        default: 'bone',
      },
      { name: 'density', type: 'number', default: 0.5, min: 0.1, max: 0.9 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'biomimetic', type: 'Shape' }],
  },
];

// Export all templates
export const allSpecializedFeatureTemplates = [
  ...textEngravingTemplates,
  ...latticeTemplates,
  ...topologyOptimizationTemplates,
  ...organicFormTemplates,
];
