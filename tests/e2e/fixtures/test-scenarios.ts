/**
 * Test Scenarios and Data Fixtures for Sim4D E2E Tests
 * Provides standardized test data for reproducible testing
 */

export interface NodeScenario {
  id: string;
  name: string;
  description: string;
  nodeType: string;
  parameters: Record<string, any>;
  position?: { x: number; y: number };
  expectedGeometry?: {
    vertices?: number;
    faces?: number;
    volume?: number;
    boundingBox?: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
  };
}

export interface WorkflowScenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeScenario[];
  connections?: Array<{
    sourceId: string;
    sourceOutput: string;
    targetId: string;
    targetInput: string;
  }>;
  expectedResults?: {
    totalNodes: number;
    totalConnections: number;
    finalGeometryCount: number;
  };
}

export interface TestParameters {
  [key: string]: {
    valid: any[];
    invalid: any[];
    edge: any[];
  };
}

/**
 * Standard Node Test Scenarios
 */
export const NodeScenarios: Record<string, NodeScenario> = {
  // Box Geometries
  standardBox: {
    id: 'standard-box',
    name: 'Standard Box',
    description: 'Basic box with standard dimensions',
    nodeType: 'Solid::Box',
    parameters: { width: 100, height: 50, depth: 25 },
    position: { x: 400, y: 300 },
    expectedGeometry: {
      vertices: 8,
      faces: 6,
      volume: 125000,
    },
  },

  largeBox: {
    id: 'large-box',
    name: 'Large Box',
    description: 'Large box for performance testing',
    nodeType: 'Solid::Box',
    parameters: { width: 1000, height: 500, depth: 250 },
    position: { x: 400, y: 300 },
    expectedGeometry: {
      volume: 125000000,
    },
  },

  smallBox: {
    id: 'small-box',
    name: 'Small Box',
    description: 'Small box for precision testing',
    nodeType: 'Solid::Box',
    parameters: { width: 1, height: 1, depth: 1 },
    position: { x: 400, y: 300 },
    expectedGeometry: {
      volume: 1,
    },
  },

  cubeBox: {
    id: 'cube-box',
    name: 'Cube',
    description: 'Perfect cube for symmetry testing',
    nodeType: 'Solid::Box',
    parameters: { width: 50, height: 50, depth: 50 },
    position: { x: 400, y: 300 },
    expectedGeometry: {
      volume: 125000,
    },
  },

  // Cylinder Geometries
  standardCylinder: {
    id: 'standard-cylinder',
    name: 'Standard Cylinder',
    description: 'Basic cylinder with standard dimensions',
    nodeType: 'Solid::Cylinder',
    parameters: { radius: 25, height: 100 },
    position: { x: 400, y: 300 },
    expectedGeometry: {
      volume: Math.PI * 25 * 25 * 100,
    },
  },

  tallCylinder: {
    id: 'tall-cylinder',
    name: 'Tall Cylinder',
    description: 'Tall cylinder for aspect ratio testing',
    nodeType: 'Solid::Cylinder',
    parameters: { radius: 10, height: 200 },
    position: { x: 400, y: 300 },
  },

  wideCylinder: {
    id: 'wide-cylinder',
    name: 'Wide Cylinder',
    description: 'Wide cylinder for aspect ratio testing',
    nodeType: 'Solid::Cylinder',
    parameters: { radius: 50, height: 20 },
    position: { x: 400, y: 300 },
  },
};

/**
 * Complex Workflow Scenarios
 */
export const WorkflowScenarios: Record<string, WorkflowScenario> = {
  simpleBoxCylinder: {
    id: 'simple-box-cylinder',
    name: 'Simple Box and Cylinder',
    description: 'Basic workflow with two separate geometries',
    nodes: [
      { ...NodeScenarios.standardBox, position: { x: 200, y: 200 } },
      { ...NodeScenarios.standardCylinder, position: { x: 200, y: 350 } },
    ],
    expectedResults: {
      totalNodes: 2,
      totalConnections: 0,
      finalGeometryCount: 2,
    },
  },

  multiBoxArrangement: {
    id: 'multi-box-arrangement',
    name: 'Multiple Box Arrangement',
    description: 'Array of boxes for performance testing',
    nodes: [
      { ...NodeScenarios.standardBox, id: 'box-1', position: { x: 200, y: 200 } },
      { ...NodeScenarios.cubeBox, id: 'box-2', position: { x: 350, y: 200 } },
      { ...NodeScenarios.smallBox, id: 'box-3', position: { x: 500, y: 200 } },
      { ...NodeScenarios.standardBox, id: 'box-4', position: { x: 200, y: 350 } },
      { ...NodeScenarios.cubeBox, id: 'box-5', position: { x: 350, y: 350 } },
    ],
    expectedResults: {
      totalNodes: 5,
      totalConnections: 0,
      finalGeometryCount: 5,
    },
  },

  cylinderVariations: {
    id: 'cylinder-variations',
    name: 'Cylinder Variations',
    description: 'Different cylinder configurations',
    nodes: [
      { ...NodeScenarios.standardCylinder, id: 'cyl-1', position: { x: 200, y: 200 } },
      { ...NodeScenarios.tallCylinder, id: 'cyl-2', position: { x: 350, y: 200 } },
      { ...NodeScenarios.wideCylinder, id: 'cyl-3', position: { x: 500, y: 200 } },
    ],
    expectedResults: {
      totalNodes: 3,
      totalConnections: 0,
      finalGeometryCount: 3,
    },
  },

  complexMixedWorkflow: {
    id: 'complex-mixed-workflow',
    name: 'Complex Mixed Workflow',
    description: 'Mixed geometry types for comprehensive testing',
    nodes: [
      { ...NodeScenarios.standardBox, id: 'main-box', position: { x: 200, y: 200 } },
      { ...NodeScenarios.standardCylinder, id: 'main-cylinder', position: { x: 200, y: 350 } },
      { ...NodeScenarios.cubeBox, id: 'secondary-box', position: { x: 400, y: 200 } },
      { ...NodeScenarios.tallCylinder, id: 'secondary-cylinder', position: { x: 400, y: 350 } },
    ],
    expectedResults: {
      totalNodes: 4,
      totalConnections: 0,
      finalGeometryCount: 4,
    },
  },
};

/**
 * Parameter Test Data
 */
export const TestParameters: TestParameters = {
  width: {
    valid: [1, 10, 50, 100, 500, 1000],
    invalid: [0, -1, -10, 'abc', null, undefined],
    edge: [0.001, 0.1, 9999, 10000],
  },
  height: {
    valid: [1, 10, 50, 100, 500, 1000],
    invalid: [0, -1, -10, 'abc', null, undefined],
    edge: [0.001, 0.1, 9999, 10000],
  },
  depth: {
    valid: [1, 10, 50, 100, 500, 1000],
    invalid: [0, -1, -10, 'abc', null, undefined],
    edge: [0.001, 0.1, 9999, 10000],
  },
  radius: {
    valid: [1, 5, 10, 25, 50, 100],
    invalid: [0, -1, -5, 'abc', null, undefined],
    edge: [0.001, 0.1, 999, 1000],
  },
};

/**
 * Performance Test Scenarios
 */
export const PerformanceScenarios = {
  lightLoad: {
    name: 'Light Load',
    description: '1-3 simple nodes',
    maxNodes: 3,
    maxEvaluationTime: 1000, // 1 second
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  },

  mediumLoad: {
    name: 'Medium Load',
    description: '5-10 nodes with connections',
    maxNodes: 10,
    maxEvaluationTime: 5000, // 5 seconds
    maxMemoryUsage: 150 * 1024 * 1024, // 150MB
  },

  heavyLoad: {
    name: 'Heavy Load',
    description: '20+ nodes with complex operations',
    maxNodes: 25,
    maxEvaluationTime: 15000, // 15 seconds
    maxMemoryUsage: 300 * 1024 * 1024, // 300MB
  },
};

/**
 * Visual Regression Test Data
 */
export const VisualTestScenarios = {
  standardViews: [
    { name: 'front', camera: { azimuth: 0, elevation: 0 } },
    { name: 'right', camera: { azimuth: 90, elevation: 0 } },
    { name: 'back', camera: { azimuth: 180, elevation: 0 } },
    { name: 'left', camera: { azimuth: 270, elevation: 0 } },
    { name: 'top', camera: { azimuth: 0, elevation: 90 } },
    { name: 'bottom', camera: { azimuth: 0, elevation: -90 } },
    { name: 'isometric', camera: { azimuth: 45, elevation: 30 } },
  ],

  renderingModes: ['solid', 'wireframe'],

  zoomLevels: [
    { name: 'far', zoomOut: 5 },
    { name: 'normal', fitAll: true },
    { name: 'close', zoomIn: 3 },
  ],
};

/**
 * Error Test Scenarios
 */
export const ErrorScenarios = {
  invalidParameters: [
    { parameter: 'width', value: -10, expectedError: 'negative_value' },
    { parameter: 'height', value: 0, expectedError: 'zero_value' },
    { parameter: 'radius', value: 'abc', expectedError: 'invalid_type' },
    { parameter: 'depth', value: null, expectedError: 'null_value' },
  ],

  extremeValues: [
    { parameter: 'width', value: 999999, expectedBehavior: 'clamp_or_error' },
    { parameter: 'height', value: 0.0001, expectedBehavior: 'precision_limit' },
    { parameter: 'radius', value: -999, expectedBehavior: 'validation_error' },
  ],
};

/**
 * Inspector Test Data
 */
export const InspectorTestScenarios = {
  parameterEditing: {
    singleParameter: [
      { name: 'width', from: '100', to: '200' },
      { name: 'height', from: '50', to: '75' },
      { name: 'radius', from: '25', to: '40' },
    ],
    multipleParameters: [
      { name: 'width', from: '100', to: '150' },
      { name: 'height', from: '50', to: '80' },
      { name: 'depth', from: '25', to: '35' },
    ],
  },

  performanceThresholds: {
    responseTime: 500, // 500ms
    evaluationTime: 2000, // 2 seconds
    memoryGrowth: 10 * 1024 * 1024, // 10MB
  },
};

/**
 * Utility functions for test scenarios
 */
export class TestScenarioHelper {
  static getScenario(id: string): NodeScenario | undefined {
    return NodeScenarios[id];
  }

  static getWorkflow(id: string): WorkflowScenario | undefined {
    return WorkflowScenarios[id];
  }

  static getRandomValidParameter(parameterName: string): any {
    const values = TestParameters[parameterName]?.valid;
    return values ? values[Math.floor(Math.random() * values.length)] : 100;
  }

  static getRandomInvalidParameter(parameterName: string): any {
    const values = TestParameters[parameterName]?.invalid;
    return values ? values[Math.floor(Math.random() * values.length)] : -1;
  }

  static createParameterVariant(
    baseScenario: NodeScenario,
    parameterName: string,
    value: any
  ): NodeScenario {
    return {
      ...baseScenario,
      id: `${baseScenario.id}-${parameterName}-${value}`,
      name: `${baseScenario.name} (${parameterName}: ${value})`,
      parameters: {
        ...baseScenario.parameters,
        [parameterName]: value,
      },
    };
  }

  static generatePerformanceScenario(nodeCount: number): WorkflowScenario {
    const nodes: NodeScenario[] = [];
    const scenarios = Object.values(NodeScenarios);

    for (let i = 0; i < nodeCount; i++) {
      const baseScenario = scenarios[i % scenarios.length];
      nodes.push({
        ...baseScenario,
        id: `perf-node-${i}`,
        position: {
          x: 200 + (i % 5) * 150,
          y: 200 + Math.floor(i / 5) * 150,
        },
      });
    }

    return {
      id: `performance-${nodeCount}-nodes`,
      name: `Performance Test - ${nodeCount} Nodes`,
      description: `Performance test scenario with ${nodeCount} nodes`,
      nodes,
      expectedResults: {
        totalNodes: nodeCount,
        totalConnections: 0,
        finalGeometryCount: nodeCount,
      },
    };
  }
}
