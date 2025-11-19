/**
 * OCCT Test Runner - Validates real geometry operations
 * Can be run in both Node.js and browser environments
 */

import { WASMLoader as _WASMLoader, detectWASMCapabilities, WASMCapabilities } from './wasm-loader';
import { loadOCCT, OCCTMemoryManager } from './occt-bindings';

// OCCT Shape interface
interface OCCTShape {
  id: string;
  type: string;
  volume: number;
  area: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
}

// OCCT Mesh interface
interface OCCTMesh {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  vertexCount: number;
  triangleCount: number;
  edgeCount?: number;
}

// OCCT Module interface
interface OCCTModule {
  makeBox: (width: number, height: number, depth: number) => OCCTShape;
  makeBoxWithOrigin: (x: number, y: number, z: number, width: number, height: number, depth: number) => OCCTShape;
  makeSphere: (radius: number) => OCCTShape;
  makeCylinder: (radius: number, height: number) => OCCTShape;
  makeTorus: (majorRadius: number, minorRadius: number) => OCCTShape;
  booleanUnion: (shape1Id: string, shape2Id: string) => OCCTShape;
  booleanSubtract: (shape1Id: string, shape2Id: string) => OCCTShape;
  booleanIntersect: (shape1Id: string, shape2Id: string) => OCCTShape;
  makeFillet: (shapeId: string, radius: number) => OCCTShape;
  makeChamfer: (shapeId: string, distance: number) => OCCTShape;
  makeShell: (shapeId: string, thickness: number) => OCCTShape;
  transform: (shapeId: string, tx: number, ty: number, tz: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number) => OCCTShape;
  copyShape: (shapeId: string) => OCCTShape;
  tessellate: (shapeId: string, linearDeflection: number, angularDeflection: number) => OCCTMesh;
  deleteShape: (shapeId: string) => void;
  clearAllShapes: () => void;
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

export class OCCTTestRunner {
  private occtModule: OCCTModule | null = null;
  private capabilities: WASMCapabilities | null = null;

  /**
   * Initialize test environment
   */
  async initialize(): Promise<boolean> {
    console.log('[TestRunner] Initializing OCCT test environment...');

    try {
      // Check capabilities
      this.capabilities = await detectWASMCapabilities();
      console.log('[TestRunner] WASM Capabilities:', this.capabilities);

      if (!this.capabilities.hasWASM) {
        console.error('[TestRunner] WebAssembly not supported - tests cannot run');
        return false;
      }

      // Load OCCT module
      this.occtModule = await loadOCCT();
      console.log('[TestRunner] OCCT module loaded successfully');

      return true;
    } catch (error) {
      console.error('[TestRunner] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<TestSuite[]> {
    if (!this.occtModule) {
      throw new Error('Test runner not initialized');
    }

    const suites = [
      await this.runPrimitiveTests(),
      await this.runBooleanTests(),
      await this.runFeatureTests(),
      await this.runTransformTests(),
      await this.runTessellationTests(),
      await this.runPerformanceTests(),
    ];

    // Print summary
    this.printSummary(suites);

    return suites;
  }

  /**
   * Test primitive creation
   */
  private async runPrimitiveTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    // Box test
    tests.push(
      await this.runTest('Create Box', async () => {
        const box = this.occtModule.makeBox(100, 50, 25);
        this.validateShape(box, 'solid');
        this.occtModule.deleteShape(box.id);
        return { volume: box.volume, dimensions: [100, 50, 25] };
      })
    );

    // Sphere test
    tests.push(
      await this.runTest('Create Sphere', async () => {
        const sphere = this.occtModule.makeSphere(30);
        this.validateShape(sphere, 'solid');
        const expectedVolume = (4 / 3) * Math.PI * Math.pow(30, 3);
        const volumeError = Math.abs(sphere.volume - expectedVolume) / expectedVolume;
        this.occtModule.deleteShape(sphere.id);
        return { volume: sphere.volume, expectedVolume, volumeError };
      })
    );

    // Cylinder test
    tests.push(
      await this.runTest('Create Cylinder', async () => {
        const cylinder = this.occtModule.makeCylinder(20, 60);
        this.validateShape(cylinder, 'solid');
        const expectedVolume = Math.PI * Math.pow(20, 2) * 60;
        this.occtModule.deleteShape(cylinder.id);
        return { volume: cylinder.volume, expectedVolume };
      })
    );

    // Torus test
    tests.push(
      await this.runTest('Create Torus', async () => {
        const torus = this.occtModule.makeTorus(40, 8);
        this.validateShape(torus, 'solid');
        this.occtModule.deleteShape(torus.id);
        return { volume: torus.volume };
      })
    );

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Primitive Creation',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Test boolean operations
   */
  private async runBooleanTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    // Setup test shapes
    const box1 = this.occtModule.makeBoxWithOrigin(0, 0, 0, 60, 40, 30);
    const box2 = this.occtModule.makeBoxWithOrigin(30, 20, 15, 60, 40, 30);

    try {
      // Union test
      tests.push(
        await this.runTest('Boolean Union', async () => {
          const union = this.occtModule.booleanUnion(box1.id, box2.id);
          this.validateShape(union, 'solid');
          const totalVolume = box1.volume + box2.volume;
          this.occtModule.deleteShape(union.id);
          return { volume: union.volume, totalVolume };
        })
      );

      // Subtraction test
      tests.push(
        await this.runTest('Boolean Subtract', async () => {
          const difference = this.occtModule.booleanSubtract(box1.id, box2.id);
          this.validateShape(difference, 'solid');
          this.occtModule.deleteShape(difference.id);
          return { volume: difference.volume, originalVolume: box1.volume };
        })
      );

      // Intersection test
      tests.push(
        await this.runTest('Boolean Intersect', async () => {
          const intersection = this.occtModule.booleanIntersect(box1.id, box2.id);
          this.validateShape(intersection, 'solid');
          this.occtModule.deleteShape(intersection.id);
          return { volume: intersection.volume };
        })
      );
    } finally {
      // Cleanup
      this.occtModule.deleteShape(box1.id);
      this.occtModule.deleteShape(box2.id);
    }

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Boolean Operations',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Test feature operations
   */
  private async runFeatureTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    const baseShape = this.occtModule.makeBox(60, 40, 20);

    try {
      // Fillet test
      tests.push(
        await this.runTest('Create Fillet', async () => {
          const filleted = this.occtModule.makeFillet(baseShape.id, 3);
          this.validateShape(filleted, 'solid');
          this.occtModule.deleteShape(filleted.id);
          return { volume: filleted.volume, originalVolume: baseShape.volume };
        })
      );

      // Chamfer test
      tests.push(
        await this.runTest('Create Chamfer', async () => {
          const chamfered = this.occtModule.makeChamfer(baseShape.id, 3);
          this.validateShape(chamfered, 'solid');
          this.occtModule.deleteShape(chamfered.id);
          return { volume: chamfered.volume, originalVolume: baseShape.volume };
        })
      );

      // Shell test
      tests.push(
        await this.runTest('Create Shell', async () => {
          const shelled = this.occtModule.makeShell(baseShape.id, 2);
          this.validateShape(shelled, 'solid');
          this.occtModule.deleteShape(shelled.id);
          return { volume: shelled.volume, originalVolume: baseShape.volume };
        })
      );
    } finally {
      this.occtModule.deleteShape(baseShape.id);
    }

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Feature Operations',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Test transformations
   */
  private async runTransformTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    const originalShape = this.occtModule.makeSphere(25);

    try {
      // Translation test
      tests.push(
        await this.runTest('Transform Translation', async () => {
          const translated = this.occtModule.transform(
            originalShape.id,
            50,
            30,
            20,
            0,
            0,
            0,
            1,
            1,
            1
          );
          this.validateShape(translated, 'solid');
          this.occtModule.deleteShape(translated.id);
          return {
            volume: translated.volume,
            originalVolume: originalShape.volume,
            centerX: translated.centerX,
            centerY: translated.centerY,
            centerZ: translated.centerZ,
          };
        })
      );

      // Scaling test
      tests.push(
        await this.runTest('Transform Scale', async () => {
          const scaled = this.occtModule.transform(originalShape.id, 0, 0, 0, 0, 0, 0, 2, 2, 2);
          this.validateShape(scaled, 'solid');
          const expectedVolume = originalShape.volume * 8; // 2^3
          this.occtModule.deleteShape(scaled.id);
          return { volume: scaled.volume, expectedVolume };
        })
      );

      // Copy test
      tests.push(
        await this.runTest('Copy Shape', async () => {
          const copied = this.occtModule.copyShape(originalShape.id);
          this.validateShape(copied, 'solid');
          this.occtModule.deleteShape(copied.id);
          return {
            volume: copied.volume,
            originalVolume: originalShape.volume,
            sameId: copied.id === originalShape.id,
          };
        })
      );
    } finally {
      this.occtModule.deleteShape(originalShape.id);
    }

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Transform Operations',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Test tessellation
   */
  private async runTessellationTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    const testShape = this.occtModule.makeCylinder(15, 40);

    try {
      // Basic tessellation
      tests.push(
        await this.runTest('Basic Tessellation', async () => {
          const mesh = this.occtModule.tessellate(testShape.id, 0.5, 0.2);
          this.validateMesh(mesh);
          return {
            vertexCount: mesh.vertexCount,
            triangleCount: mesh.triangleCount,
            edgeCount: mesh.edgeCount,
          };
        })
      );

      // High quality tessellation
      tests.push(
        await this.runTest('High Quality Tessellation', async () => {
          const mesh = this.occtModule.tessellate(testShape.id, 0.1, 0.05);
          this.validateMesh(mesh);
          return {
            vertexCount: mesh.vertexCount,
            triangleCount: mesh.triangleCount,
          };
        })
      );
    } finally {
      this.occtModule.deleteShape(testShape.id);
    }

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Tessellation',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Test performance benchmarks
   */
  private async runPerformanceTests(): Promise<TestSuite> {
    const tests: TestResult[] = [];
    const suiteStart = performance.now();

    // Primitive creation performance
    tests.push(
      await this.runTest('Primitive Creation Performance', async () => {
        const start = performance.now();
        const shapes = [];

        for (let i = 0; i < 50; i++) {
          shapes.push(this.occtModule.makeBox(10 + i, 10 + i, 10 + i));
        }

        const end = performance.now();
        const totalTime = end - start;
        const avgTime = totalTime / 50;

        // Cleanup
        for (const shape of shapes) {
          this.occtModule.deleteShape(shape.id);
        }

        if (avgTime > 100) {
          // More than 100ms per primitive
          throw new Error(`Primitive creation too slow: ${avgTime.toFixed(2)}ms average`);
        }

        return { totalTime, avgTime, count: 50 };
      })
    );

    // Boolean operation performance
    tests.push(
      await this.runTest('Boolean Operation Performance', async () => {
        const box1 = this.occtModule.makeBox(40, 40, 40);
        const box2 = this.occtModule.makeBoxWithOrigin(20, 20, 20, 40, 40, 40);

        const start = performance.now();
        const union = this.occtModule.booleanUnion(box1.id, box2.id);
        const end = performance.now();

        const operationTime = end - start;

        this.occtModule.deleteShape(box1.id);
        this.occtModule.deleteShape(box2.id);
        this.occtModule.deleteShape(union.id);

        if (operationTime > 2000) {
          // More than 2 seconds
          throw new Error(`Boolean operation too slow: ${operationTime.toFixed(2)}ms`);
        }

        return { operationTime };
      })
    );

    const suiteDuration = performance.now() - suiteStart;

    return {
      name: 'Performance Benchmarks',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter((t) => t.passed).length,
        failed: tests.filter((t) => !t.passed).length,
        duration: suiteDuration,
      },
    };
  }

  /**
   * Run individual test with error handling
   */
  private async runTest(name: string, testFn: () => Promise<unknown>): Promise<TestResult> {
    const start = performance.now();

    try {
      const details = await testFn();
      const duration = performance.now() - start;

      console.log(`✅ ${name} (${duration.toFixed(2)}ms)`);

      return {
        name,
        passed: true,
        duration,
        details,
      };
    } catch (error) {
      const duration = performance.now() - start;

      console.error(`❌ ${name} (${duration.toFixed(2)}ms):`, error);

      return {
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Validate shape handle
   */
  private validateShape(shape: OCCTShape, expectedType: string): void {
    if (!shape || !shape.id) {
      throw new Error('Invalid shape handle');
    }

    if (shape.type !== expectedType) {
      throw new Error(`Expected type ${expectedType}, got ${shape.type}`);
    }

    if (expectedType === 'solid' && (!shape.volume || shape.volume <= 0)) {
      throw new Error(`Invalid volume for solid: ${shape.volume}`);
    }

    if (!shape.area || shape.area <= 0) {
      throw new Error(`Invalid area: ${shape.area}`);
    }
  }

  /**
   * Validate mesh data
   */
  private validateMesh(mesh: OCCTMesh): void {
    if (!mesh) {
      throw new Error('Invalid mesh data');
    }

    if (!(mesh.positions instanceof Float32Array) || mesh.positions.length === 0) {
      throw new Error('Invalid positions array');
    }

    if (!(mesh.normals instanceof Float32Array) || mesh.normals.length !== mesh.positions.length) {
      throw new Error('Invalid normals array');
    }

    if (!(mesh.indices instanceof Uint32Array) || mesh.indices.length === 0) {
      throw new Error('Invalid indices array');
    }

    if (mesh.positions.length % 3 !== 0) {
      throw new Error('Positions array length not multiple of 3');
    }

    if (mesh.indices.length % 3 !== 0) {
      throw new Error('Indices array length not multiple of 3');
    }

    const maxIndex = Math.max(...mesh.indices);
    const vertexCount = mesh.positions.length / 3;

    if (maxIndex >= vertexCount) {
      throw new Error('Index out of bounds');
    }
  }

  /**
   * Print test results summary
   */
  private printSummary(suites: TestSuite[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('OCCT TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalDuration = 0;

    for (const suite of suites) {
      const passRate = ((suite.summary.passed / suite.summary.total) * 100).toFixed(1);
      console.log(`\n${suite.name}:`);
      console.log(
        `  ✅ ${suite.summary.passed}/${suite.summary.total} tests passed (${passRate}%)`
      );
      console.log(`  ⏱️  Duration: ${suite.summary.duration.toFixed(2)}ms`);

      totalTests += suite.summary.total;
      totalPassed += suite.summary.passed;
      totalDuration += suite.summary.duration;
    }

    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log('\n' + '-'.repeat(40));
    console.log(`OVERALL: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
    console.log(`TOTAL DURATION: ${totalDuration.toFixed(2)}ms`);

    if (totalPassed === totalTests) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log(`⚠️  ${totalTests - totalPassed} tests failed`);
    }

    console.log('='.repeat(60));
  }

  /**
   * Cleanup test environment
   */
  async cleanup(): Promise<void> {
    if (this.occtModule) {
      try {
        this.occtModule.clearAllShapes();
        OCCTMemoryManager.cleanup();
        console.log('[TestRunner] Cleanup completed');
      } catch (error) {
        console.warn('[TestRunner] Cleanup error:', error);
      }
    }
  }
}

/**
 * Run OCCT tests (can be called from CLI or browser)
 */
export async function runOCCTTests(): Promise<TestSuite[]> {
  const runner = new OCCTTestRunner();

  try {
    const initialized = await runner.initialize();

    if (!initialized) {
      throw new Error('Failed to initialize OCCT test environment');
    }

    const results = await runner.runAllTests();
    return results;
  } finally {
    await runner.cleanup();
  }
}

// CLI support
if (typeof process !== 'undefined' && process.argv && process.argv.includes('--run-tests')) {
  runOCCTTests()
    .then((results) => {
      const allPassed = results.every((suite) => suite.summary.passed === suite.summary.total);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}
