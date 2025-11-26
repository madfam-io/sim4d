/**
 * Template Registry
 *
 * Central registry of example templates for Sim4D.
 * Provides metadata, thumbnails, and loading functionality.
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'mechanical' | 'architectural' | 'product' | 'learning';
  tags: string[];
  estimatedTime: string; // e.g., "3 minutes"
  thumbnailUrl?: string; // Path to preview image
  graphPath: string; // Path to .bflow.json file
  nodeCount: number;
  usesNodes: string[]; // List of node types used
  learningObjectives?: string[]; // What users will learn
}

/**
 * Template Registry
 *
 * All available templates organized by difficulty and category.
 */
export const TEMPLATE_REGISTRY: Template[] = [
  // Beginner Templates
  {
    id: 'simple-box',
    name: 'Simple Box',
    description: 'Basic parametric box with rounded edges. Learn fundamental CAD operations.',
    difficulty: 'beginner',
    category: 'learning',
    tags: ['beginner', 'primitive', 'fillet', 'basic'],
    estimatedTime: '2 minutes',
    graphPath: '/examples/graphs/simple-box.bflow.json',
    nodeCount: 3,
    usesNodes: ['Solid::Box', 'Features::Fillet', 'IO::ExportSTEP'],
    learningObjectives: ['Create 3D primitives', 'Apply fillets to edges', 'Export to STEP format'],
  },
  {
    id: 'mounting-bracket',
    name: 'L-Bracket',
    description: 'Mounting bracket with holes and fillets. Perfect first mechanical part.',
    difficulty: 'beginner',
    category: 'mechanical',
    tags: ['bracket', 'mechanical', 'beginner', 'boolean'],
    estimatedTime: '3 minutes',
    graphPath: '/examples/graphs/bracket-mounting.bflow.json',
    nodeCount: 9,
    usesNodes: [
      'Solid::Box',
      'Transform::Move',
      'Boolean::Union',
      'Boolean::Subtract',
      'Features::Fillet',
      'Solid::Cylinder',
      'Transform::ArrayLinear',
    ],
    learningObjectives: [
      'Combine shapes with Boolean operations',
      'Position parts with transforms',
      'Create hole patterns',
      'Apply multiple fillets',
    ],
  },

  // Intermediate Templates
  {
    id: 'boolean-union',
    name: 'Boolean Union',
    description: 'Combine two cylinders to create a compound shape.',
    difficulty: 'intermediate',
    category: 'learning',
    tags: ['boolean', 'union', 'intermediate'],
    estimatedTime: '2 minutes',
    graphPath: '/examples/graphs/boolean-union.bflow.json',
    nodeCount: 4,
    usesNodes: ['Solid::Cylinder', 'Boolean::Union'],
    learningObjectives: ['Understand Boolean union operations', 'Combine multiple primitives'],
  },
  {
    id: 'boolean-subtract',
    name: 'Boolean Subtraction',
    description: 'Subtract a sphere from a box to create a cavity.',
    difficulty: 'intermediate',
    category: 'learning',
    tags: ['boolean', 'subtract', 'intermediate'],
    estimatedTime: '2 minutes',
    graphPath: '/examples/graphs/boolean-subtract.bflow.json',
    nodeCount: 4,
    usesNodes: ['Solid::Box', 'Solid::Sphere', 'Boolean::Subtract'],
    learningObjectives: ['Understand Boolean subtraction', 'Create cavities and pockets'],
  },
  {
    id: 'parametric-enclosure',
    name: 'Parametric Enclosure',
    description: 'Project enclosure with mounting bosses and shell operation.',
    difficulty: 'intermediate',
    category: 'product',
    tags: ['enclosure', 'parametric', 'shell', 'pattern'],
    estimatedTime: '5 minutes',
    graphPath: '/examples/graphs/enclosure.bflow.json',
    nodeCount: 6,
    usesNodes: [
      'Solid::Box',
      'Features::Shell',
      'Solid::Cylinder',
      'Transform::ArrayLinear',
      'Boolean::Union',
      'Features::Fillet',
    ],
    learningObjectives: [
      'Use shell to create hollow parts',
      'Create parametric patterns',
      'Combine multiple features',
      'Use parameters (@L, @W, @H)',
    ],
  },
  {
    id: 'gear-basic',
    name: 'Simple Gear',
    description: 'Parametric spur gear with teeth and shaft hole.',
    difficulty: 'intermediate',
    category: 'mechanical',
    tags: ['gear', 'mechanical', 'circular-pattern'],
    estimatedTime: '5 minutes',
    graphPath: '/examples/graphs/gear-basic.bflow.json',
    nodeCount: 7,
    usesNodes: [
      'Sketch::Polygon',
      'Solid::Extrude',
      'Transform::ArrayCircular',
      'Solid::Cylinder',
      'Boolean::Union',
      'Boolean::Subtract',
    ],
    learningObjectives: [
      'Create custom 2D profiles',
      'Use circular patterns',
      'Combine multiple Boolean operations',
      'Design mechanical components',
    ],
  },
];

/**
 * Get templates by difficulty level
 */
export function getTemplatesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Template[] {
  return TEMPLATE_REGISTRY.filter((t) => t.difficulty === difficulty);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: 'mechanical' | 'architectural' | 'product' | 'learning'
): Template[] {
  return TEMPLATE_REGISTRY.filter((t) => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id);
}

/**
 * Get recommended templates for new users
 */
export function getRecommendedTemplates(): Template[] {
  return [
    getTemplateById('simple-box'),
    getTemplateById('mounting-bracket'),
    getTemplateById('parametric-enclosure'),
  ].filter((t): t is Template => t !== undefined);
}

/**
 * Get templates that use a specific node type
 */
export function getTemplatesByNode(nodeType: string): Template[] {
  return TEMPLATE_REGISTRY.filter((t) => t.usesNodes.includes(nodeType));
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATE_REGISTRY.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get template statistics
 */
export function getTemplateStats() {
  return {
    total: TEMPLATE_REGISTRY.length,
    byDifficulty: {
      beginner: getTemplatesByDifficulty('beginner').length,
      intermediate: getTemplatesByDifficulty('intermediate').length,
      advanced: getTemplatesByDifficulty('advanced').length,
    },
    byCategory: {
      mechanical: getTemplatesByCategory('mechanical').length,
      architectural: getTemplatesByCategory('architectural').length,
      product: getTemplatesByCategory('product').length,
      learning: getTemplatesByCategory('learning').length,
    },
  };
}
