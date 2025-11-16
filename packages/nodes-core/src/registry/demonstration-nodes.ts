/**
 * Demonstration Nodes
 * Creates a comprehensive set of example nodes to showcase the enhanced UI capabilities
 */

import { NodeDefinition } from '@brepflow/types';

/**
 * Creates a comprehensive set of demonstration nodes across multiple categories
 * to showcase the enhanced node palette UI capabilities
 */
export function createDemonstrationNodes(): NodeDefinition[] {
  const nodes: NodeDefinition[] = [];

  // Solid Primitives
  nodes.push(
    createDemoNode(
      'AdvancedBox',
      'Solid',
      'Primitives',
      'Advanced parametric box with rounded corners and chamfers'
    ),
    createDemoNode('ParametricSphere', 'Solid', 'Primitives', 'Parametric sphere with UV controls'),
    createDemoNode(
      'AdvancedCylinder',
      'Solid',
      'Primitives',
      'Cylinder with variable radius and taper'
    ),
    createDemoNode(
      'ParametricCone',
      'Solid',
      'Primitives',
      'Cone with elliptical base and variable angle'
    ),
    createDemoNode('AdvancedTorus', 'Solid', 'Primitives', 'Torus with variable cross-section'),
    createDemoNode('Ellipsoid', 'Solid', 'Primitives', 'Three-axis ellipsoid'),
    createDemoNode('Prism', 'Solid', 'Primitives', 'N-sided prism with parametric height'),
    createDemoNode('Pyramid', 'Solid', 'Primitives', 'N-sided pyramid with apex control')
  );

  // Advanced Features
  nodes.push(
    createDemoNode(
      'VariableFillets',
      'Features',
      'Fillets',
      'Variable radius fillets with multiple control points'
    ),
    createDemoNode('ChainFillets', 'Features', 'Fillets', 'Chain fillets across connected edges'),
    createDemoNode('BlendFillets', 'Features', 'Fillets', 'Blend fillets between surfaces'),
    createDemoNode('SimpleHole', 'Features', 'Holes', 'Simple cylindrical hole'),
    createDemoNode('CounterboreHole', 'Features', 'Holes', 'Counterbore hole with shoulder'),
    createDemoNode('CountersinkHole', 'Features', 'Holes', 'Countersink hole with angular cut'),
    createDemoNode('ThreadedHole', 'Features', 'Holes', 'Threaded hole with pitch control'),
    createDemoNode(
      'RectangularPocket',
      'Features',
      'Pockets',
      'Rectangular pocket with rounded corners'
    ),
    createDemoNode('CircularPocket', 'Features', 'Pockets', 'Circular pocket with depth control')
  );

  // Boolean Operations
  nodes.push(
    createDemoNode(
      'IntelligentUnion',
      'Boolean',
      'Operations',
      'Union with automatic tolerance adjustment'
    ),
    createDemoNode(
      'IntelligentSubtraction',
      'Boolean',
      'Operations',
      'Subtraction with gap healing'
    ),
    createDemoNode(
      'IntelligentIntersection',
      'Boolean',
      'Operations',
      'Intersection with surface blending'
    ),
    createDemoNode('SplitBody', 'Boolean', 'Operations', 'Split body with plane or surface'),
    createDemoNode('TrimSurface', 'Boolean', 'Operations', 'Trim surface with curve or boundary')
  );

  // Transform Operations
  nodes.push(
    createDemoNode(
      'AdvancedMove',
      'Transform',
      'Position',
      'Move with coordinate system alignment'
    ),
    createDemoNode('AdvancedRotate', 'Transform', 'Position', 'Rotate with axis and angle control'),
    createDemoNode(
      'NonUniformScale',
      'Transform',
      'Position',
      'Scale with different X, Y, Z factors'
    ),
    createDemoNode(
      'LinearPattern',
      'Transform',
      'Patterns',
      'Linear pattern with direction control'
    ),
    createDemoNode('CircularPattern', 'Transform', 'Patterns', 'Circular pattern around axis'),
    createDemoNode('PathPattern', 'Transform', 'Patterns', 'Pattern along curve or path'),
    createDemoNode('MirrorPlane', 'Transform', 'Symmetry', 'Mirror across plane'),
    createDemoNode('MirrorPoint', 'Transform', 'Symmetry', 'Mirror across point')
  );

  // Surface Operations
  nodes.push(
    createDemoNode('LoftSurface', 'Surface', 'Creation', 'Loft between multiple profiles'),
    createDemoNode('SweepSurface', 'Surface', 'Creation', 'Sweep profile along path'),
    createDemoNode('RevolveSurface', 'Surface', 'Creation', 'Revolve profile around axis'),
    createDemoNode('BoundingSurface', 'Surface', 'Creation', 'Surface bounded by curves'),
    createDemoNode('BlendSurface', 'Surface', 'Creation', 'Blend between two surfaces'),
    createDemoNode('OffsetSurface', 'Surface', 'Modification', 'Offset surface by distance'),
    createDemoNode('ExtendSurface', 'Surface', 'Modification', 'Extend surface boundaries')
  );

  // Sketch Operations
  nodes.push(
    createDemoNode('ParametricRectangle', 'Sketch', 'Shapes', 'Rectangle with width and height'),
    createDemoNode('ParametricCircle', 'Sketch', 'Shapes', 'Circle with radius control'),
    createDemoNode('ParametricEllipse', 'Sketch', 'Shapes', 'Ellipse with major/minor axes'),
    createDemoNode('ParametricPolygon', 'Sketch', 'Shapes', 'N-sided polygon'),
    createDemoNode('BezierCurve', 'Sketch', 'Curves', 'Bezier curve with control points'),
    createDemoNode('SplineCurve', 'Sketch', 'Curves', 'B-spline curve'),
    createDemoNode('NurbsCurve', 'Sketch', 'Curves', 'NURBS curve with weights')
  );

  // Manufacturing Features
  nodes.push(
    createDemoNode('ChamferEdge', 'Manufacturing', 'Preparation', 'Chamfer with distance control'),
    createDemoNode('DraftAngle', 'Manufacturing', 'Preparation', 'Draft angle for molding'),
    createDemoNode('ShellThickness', 'Manufacturing', 'Preparation', 'Shell with wall thickness'),
    createDemoNode('ToolingHoles', 'Manufacturing', 'Tooling', 'Standardized tooling holes'),
    createDemoNode('MachinedPocket', 'Manufacturing', 'Machining', 'CNC-optimized pocket'),
    createDemoNode('TurningProfile', 'Manufacturing', 'Turning', 'Lathe turning profile')
  );

  // Analysis Tools
  nodes.push(
    createDemoNode('VolumeCalculation', 'Analysis', 'Properties', 'Volume and mass properties'),
    createDemoNode('SurfaceAreaCalculation', 'Analysis', 'Properties', 'Surface area calculation'),
    createDemoNode('CenterOfMass', 'Analysis', 'Properties', 'Center of mass calculation'),
    createDemoNode('MomentsOfInertia', 'Analysis', 'Properties', 'Moments of inertia tensor'),
    createDemoNode('CurvatureAnalysis', 'Analysis', 'Quality', 'Surface curvature analysis'),
    createDemoNode('DraftAnalysis', 'Analysis', 'Quality', 'Draft angle analysis')
  );

  // Import/Export
  nodes.push(
    createDemoNode('STEPImport', 'Import', 'CAD', 'Import STEP files'),
    createDemoNode('IGESImport', 'Import', 'CAD', 'Import IGES files'),
    createDemoNode('STLImport', 'Import', 'Mesh', 'Import STL mesh files'),
    createDemoNode('OBJImport', 'Import', 'Mesh', 'Import OBJ mesh files'),
    createDemoNode('STEPExport', 'Export', 'CAD', 'Export to STEP format'),
    createDemoNode('STLExport', 'Export', 'Mesh', 'Export to STL format')
  );

  // Data Operations
  nodes.push(
    createDemoNode('ParameterController', 'Data', 'Parameters', 'Control multiple parameters'),
    createDemoNode('ExpressionEvaluator', 'Data', 'Math', 'Evaluate mathematical expressions'),
    createDemoNode('UnitConverter', 'Data', 'Utilities', 'Convert between units'),
    createDemoNode('DataTable', 'Data', 'Storage', 'Store tabular data'),
    createDemoNode('RangeGenerator', 'Data', 'Generation', 'Generate numeric ranges')
  );

  return nodes;
}

/**
 * Helper function to create a demonstration node definition
 */
function createDemoNode(
  name: string,
  category: string,
  subcategory: string,
  description: string
): NodeDefinition {
  return {
    type: `Demo::${name}`,
    name: name,
    category: category,
    subcategory: subcategory,
    description: description,
    inputs: {
      input: { type: 'any', required: false },
    },
    outputs: {
      output: { type: 'any' },
    },
    parameters: {
      enabled: { type: 'boolean', default: true },
    },
    metadata: {
      tags: [category.toLowerCase(), subcategory.toLowerCase()],
      icon: getIconForCategory(category),
      complexity: 'intermediate',
      status: 'stable',
      version: '1.0.0',
      author: 'BrepFlow Demo System',
      documentation: `Documentation for ${name} node`,
      examples: [`Example usage of ${name}`],
    },
    evaluate: async (inputs: any, parameters: any) => {
      // Demo implementation
      return { output: `Demo result from ${name}` };
    },
  } as NodeDefinition;
}

/**
 * Get an appropriate icon for the category
 */
function getIconForCategory(category: string): string {
  const iconMap: Record<string, string> = {
    Solid: '🟦',
    Features: '🔧',
    Boolean: '🔀',
    Transform: '↔️',
    Surface: '🏔️',
    Sketch: '✏️',
    Manufacturing: '🏭',
    Analysis: '📊',
    Import: '📥',
    Export: '📤',
    Data: '💾',
  };
  return iconMap[category] || '⚙️';
}
