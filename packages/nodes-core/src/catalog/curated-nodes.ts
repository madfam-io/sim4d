/**
 * Curated Node Catalog
 *
 * Essential nodes organized by learning progression and frequency of use.
 * Reduces cognitive load from 1,827+ auto-generated nodes to 50-100 core nodes.
 *
 * Organization Strategy:
 * - Beginner nodes: Fundamental building blocks for learning
 * - Intermediate nodes: Common operations for productive work
 * - Advanced nodes: Specialized operations for complex designs
 *
 * Categories follow traditional CAD mental models for easy discovery.
 */

export interface CuratedCategory {
  id: string;
  label: string;
  description: string;
  icon?: string;
  nodes: string[]; // Node IDs
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learnOrder: number; // Suggested learning sequence
}

/**
 * Curated Node Catalog (60 essential nodes)
 *
 * Selection Criteria:
 * - Frequency: Most commonly used operations in parametric CAD
 * - Learning: Essential for building understanding
 * - Coverage: Span all major workflows (sketch → solid → features → export)
 */
export const CURATED_CATEGORIES: CuratedCategory[] = [
  // ========================================
  // BEGINNER TIER (Learn Order 1-3)
  // ========================================
  {
    id: 'sketch-basics',
    label: '2D Sketch',
    description: 'Basic 2D shapes - start here',
    icon: '✏️',
    skillLevel: 'beginner',
    learnOrder: 1,
    nodes: [
      'Sketch::Line',
      'Sketch::Circle',
      'Sketch::Rectangle',
      'Sketch::Arc',
      'Sketch::Point',
      'Sketch::Polygon',
    ],
  },
  {
    id: 'primitives',
    label: '3D Primitives',
    description: 'Basic 3D shapes',
    icon: '🧊',
    skillLevel: 'beginner',
    learnOrder: 2,
    nodes: ['Solid::Box', 'Solid::Cylinder', 'Solid::Sphere', 'Solid::Cone'],
  },
  {
    id: 'solid-operations',
    label: '3D Operations',
    description: 'Convert 2D to 3D',
    icon: '🔧',
    skillLevel: 'beginner',
    learnOrder: 3,
    nodes: ['Solid::Extrude', 'Solid::Revolve'],
  },

  // ========================================
  // INTERMEDIATE TIER (Learn Order 4-7)
  // ========================================
  {
    id: 'boolean-operations',
    label: 'Boolean Operations',
    description: 'Combine shapes',
    icon: '🔗',
    skillLevel: 'intermediate',
    learnOrder: 4,
    nodes: ['Boolean::Union', 'Boolean::Subtract', 'Boolean::Intersect'],
  },
  {
    id: 'transforms',
    label: 'Transform',
    description: 'Move, rotate, scale',
    icon: '↔️',
    skillLevel: 'intermediate',
    learnOrder: 5,
    nodes: [
      'Transform::Move',
      'Transform::Rotate',
      'Transform::Scale',
      'Transform::Mirror',
      'Transform::ArrayLinear',
      'Transform::ArrayCircular',
    ],
  },
  {
    id: 'features-basic',
    label: 'Features',
    description: 'Fillets, chamfers, shells',
    icon: '✨',
    skillLevel: 'intermediate',
    learnOrder: 6,
    nodes: ['Features::Fillet', 'Features::Chamfer', 'Features::Shell', 'Features::Offset'],
  },
  {
    id: 'io-basic',
    label: 'Import/Export',
    description: 'STEP, IGES, STL files',
    icon: '💾',
    skillLevel: 'intermediate',
    learnOrder: 7,
    nodes: ['IO::ImportSTEP', 'IO::ExportSTEP', 'IO::ExportSTL', 'IO::ExportIGES'],
  },

  // ========================================
  // ADVANCED TIER (Learn Order 8-12)
  // ========================================
  {
    id: 'solid-advanced',
    label: 'Advanced Solids',
    description: 'Sweep, loft, torus',
    icon: '🏗️',
    skillLevel: 'advanced',
    learnOrder: 8,
    nodes: ['Solid::Sweep', 'Solid::Loft', 'Solid::Torus'],
  },
  {
    id: 'curves-advanced',
    label: 'Advanced Curves',
    description: 'NURBS, interpolation, offset',
    icon: '📐',
    skillLevel: 'advanced',
    learnOrder: 9,
    nodes: [
      'Curves::NURBSCurve',
      'Curves::InterpolateCurve',
      'Curves::OffsetCurve',
      'Curves::DivideCurve',
      'Curves::BlendCurves',
    ],
  },
  {
    id: 'surfaces',
    label: 'Surfaces',
    description: 'Surface modeling',
    icon: '🌊',
    skillLevel: 'advanced',
    learnOrder: 10,
    nodes: [
      'Surfaces::PlanarSurface',
      'Surfaces::RuledSurface',
      'Surfaces::LoftSurface',
      'Surfaces::RevolveSurface',
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    description: 'Measure, validate, inspect',
    icon: '📊',
    skillLevel: 'advanced',
    learnOrder: 11,
    nodes: [
      'Analysis::Distance',
      'Analysis::Area',
      'Analysis::Volume',
      'Analysis::MassProperties',
      'Analysis::BoundingBox',
    ],
  },
  {
    id: 'data-management',
    label: 'Data',
    description: 'Lists, numbers, math',
    icon: '🔢',
    skillLevel: 'advanced',
    learnOrder: 12,
    nodes: [
      'Data::ListItem',
      'Data::ListLength',
      'Data::ListRange',
      'Data::Series',
      'Data::MathExpression',
      'Data::NumberSlider',
    ],
  },
];

/**
 * Get all curated node IDs in a flat array
 */
export function getCuratedNodeIds(): string[] {
  return CURATED_CATEGORIES.flatMap((cat) => cat.nodes);
}

/**
 * Get curated categories by skill level
 */
export function getCategoriesBySkillLevel(
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
): CuratedCategory[] {
  return CURATED_CATEGORIES.filter((cat) => cat.skillLevel === skillLevel);
}

/**
 * Get curated categories in learning order
 */
export function getCategoriesInLearningOrder(): CuratedCategory[] {
  return [...CURATED_CATEGORIES].sort((a, b) => a.learnOrder - b.learnOrder);
}

/**
 * Check if a node is in the curated catalog
 */
export function isNodeCurated(nodeId: string): boolean {
  return getCuratedNodeIds().includes(nodeId);
}

/**
 * Get category for a specific node
 */
export function getCategoryForNode(nodeId: string): CuratedCategory | null {
  return CURATED_CATEGORIES.find((cat) => cat.nodes.includes(nodeId)) || null;
}

/**
 * Statistics about the curated catalog
 */
export function getCuratedCatalogStats() {
  const totalNodes = getCuratedNodeIds().length;
  const bySkillLevel = {
    beginner: getCategoriesBySkillLevel('beginner').flatMap((c) => c.nodes).length,
    intermediate: getCategoriesBySkillLevel('intermediate').flatMap((c) => c.nodes).length,
    advanced: getCategoriesBySkillLevel('advanced').flatMap((c) => c.nodes).length,
  };

  return {
    totalCuratedNodes: totalNodes,
    totalCategories: CURATED_CATEGORIES.length,
    bySkillLevel,
    reductionFromFull: Math.round((1 - totalNodes / 1827) * 100), // % reduction from full catalog
  };
}

/**
 * Node Search Priority Weights
 *
 * When searching, curated nodes should rank higher than auto-generated ones.
 */
export const CURATED_NODE_SEARCH_BOOST = 10; // 10x priority multiplier for curated nodes

/**
 * Beginner Mode: Only show beginner-tier nodes
 */
export function getBeginnerNodes(): string[] {
  return getCategoriesBySkillLevel('beginner').flatMap((cat) => cat.nodes);
}

/**
 * Intermediate Mode: Show beginner + intermediate nodes
 */
export function getIntermediateNodes(): string[] {
  return [
    ...getCategoriesBySkillLevel('beginner'),
    ...getCategoriesBySkillLevel('intermediate'),
  ].flatMap((cat) => cat.nodes);
}

/**
 * Advanced Mode: Show all curated nodes
 */
export function getAdvancedNodes(): string[] {
  return getCuratedNodeIds();
}
