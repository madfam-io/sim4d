# BrepFlow E2E Testing Guide

## Overview

This guide covers the comprehensive End-to-End (E2E) testing framework for BrepFlow Studio, built with Playwright and optimized for CAD application testing. The framework ensures 100% reproducible user workflows across different browsers and environments.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.11.x
- pnpm 8.6+
- BrepFlow development environment set up

### Installation

```bash
# Install dependencies (includes Playwright)
pnpm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with browser UI visible
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e tests/e2e/workflows/phase3-parameter-dialogs.test.ts

# Debug tests interactively
pnpm test:e2e:debug

# View test reports
pnpm test:e2e:report
```

## 🏗️ Framework Architecture

### Directory Structure

```
tests/
├── e2e/
│   ├── workflows/                 # Test suites by feature
│   │   ├── phase3-parameter-dialogs.test.ts
│   │   ├── phase4a-live-parameter-editing.test.ts
│   │   ├── phase4b-performance-diagnostics.test.ts
│   │   └── viewport-interaction-visual.test.ts
│   ├── helpers/                   # Reusable test utilities
│   │   ├── node-test-helper.ts
│   │   ├── viewport-test-helper.ts
│   │   └── inspector-test-helper.ts
│   ├── fixtures/                  # Test data and scenarios
│   │   ├── test-scenarios.ts
│   │   └── mock-geometry.ts
│   └── data/                      # Test files and reference images
├── setup/                         # Global test configuration
│   ├── global-setup.ts
│   └── global-teardown.ts
└── playwright.config.ts           # Playwright configuration
```

### Core Components

#### Test Helpers

- **NodeTestHelper**: Node creation, manipulation, and parameter testing
- **ViewportTestHelper**: 3D viewport interaction and visual verification
- **InspectorTestHelper**: Inspector panel testing for Phase 4A/4B features

#### Test Fixtures

- **TestScenarios**: Predefined node and workflow configurations
- **MockGeometry**: Reproducible geometry data for consistent testing

#### Configuration

- **Playwright Config**: Optimized for CAD applications with WebGL support
- **CI/CD Integration**: Automated testing pipeline with visual regression

## 📝 Test Categories

### 1. Phase 3: Parameter Dialog Workflows

Tests the parameter dialog system for node creation and configuration.

**Key Test Areas:**

- Parameter dialog opening and closing
- Parameter validation and error handling
- Node creation with various parameter sets
- Keyboard navigation and accessibility

**Example:**

```typescript
test('Create Box node with parameter dialog', async ({ page }) => {
  await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

  // Verify parameter dialog opens
  await expect(page.locator('[data-testid="parameter-dialog"]')).toBeVisible();

  // Fill parameters
  await page.fill('[name="width"]', '100');
  await page.fill('[name="height"]', '50');
  await page.fill('[name="depth"]', '25');

  // Create node
  await page.click('[data-testid="create-node-button"]');

  // Verify node appears
  await expect(page.locator('[data-node-id]')).toHaveCount(1);
});
```

### 2. Phase 4A: Live Parameter Editing

Tests the Inspector panel's live parameter editing capabilities.

**Key Test Areas:**

- Real-time parameter editing without dialogs
- Undo/redo functionality
- Parameter validation and feedback
- Inspector responsiveness

**Example:**

```typescript
test('Live parameter editing without dialog popup', async ({ page }) => {
  const nodeId = await nodeHelper.createBoxNode({ width: 50, height: 50, depth: 50 });
  await nodeHelper.selectNode(nodeId);

  // Edit parameter directly in Inspector
  await inspectorHelper.editParameter('width', '150');

  // Verify no dialog opened and immediate update
  await expect(page.locator('[data-testid="parameter-dialog"]')).not.toBeVisible();
  await inspectorHelper.verifyDirtyIndicator();
  await inspectorHelper.verifyParameterValue('width', '150');
});
```

### 3. Phase 4B: Performance Monitoring and Diagnostics

Tests advanced Inspector features for performance analysis and error diagnostics.

**Key Test Areas:**

- Performance metrics collection and display
- Error diagnostics and suggestions
- Configuration management and export/import
- Performance threshold validation

**Example:**

```typescript
test('Performance metrics show realistic values', async ({ page }) => {
  const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
  await nodeHelper.selectNode(nodeId);
  await nodeHelper.evaluateGraph();

  const metrics = await inspectorHelper.getPerformanceMetrics();

  expect(metrics.computeTime).toBeGreaterThanOrEqual(0);
  expect(metrics.successRate).toBeGreaterThanOrEqual(0);
  expect(metrics.evaluationCount).toBeGreaterThanOrEqual(1);
});
```

### 4. 3D Viewport Interaction and Visual Regression

Tests viewport controls, visual rendering, and geometry interaction.

**Key Test Areas:**

- Camera controls (orbit, zoom, pan)
- Rendering modes and visual consistency
- Geometry visualization and updates
- Performance under load

**Example:**

```typescript
test('Camera orbit controls work correctly', async ({ page }) => {
  await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
  await nodeHelper.evaluateGraph();
  await viewportHelper.waitForGeometryRendered();

  // Test camera orbiting
  await viewportHelper.orbitCamera(45, 30);
  await viewportHelper.takeViewportScreenshot('camera-orbit-45-30.png');

  // Verify viewport responsiveness
  await viewportHelper.verifyViewportResponsiveness();
});
```

## 🔧 Test Helpers Usage

### NodeTestHelper

```typescript
const nodeHelper = new NodeTestHelper(page);

// Basic operations
await nodeHelper.waitForWorkspaceReady();
await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
await nodeHelper.selectNode(nodeId);
await nodeHelper.evaluateGraph();

// Advanced operations
const { nodes, connections } = await nodeHelper.createComplexWorkflow();
await nodeHelper.connectNodes({
  sourceId: 'node1',
  sourceOutput: 'output',
  targetId: 'node2',
  targetInput: 'input',
});
```

### ViewportTestHelper

```typescript
const viewportHelper = new ViewportTestHelper(page);

// Viewport initialization
await viewportHelper.waitForViewportReady();
await viewportHelper.verifyGeometryVisible();

// Camera controls
await viewportHelper.orbitCamera(45, 30);
await viewportHelper.zoomIn(3);
await viewportHelper.fitAll();

// Visual testing
await viewportHelper.takeViewportScreenshot('test-view.png');
await viewportHelper.setRenderingMode('wireframe');

// Performance testing
const metrics = await viewportHelper.getPerformanceMetrics();
await viewportHelper.verifyViewportResponsiveness(100);
```

### InspectorTestHelper

```typescript
const inspectorHelper = new InspectorTestHelper(page);

// Parameter editing (Phase 4A)
await inspectorHelper.editParameter('width', '200');
await inspectorHelper.verifyParameterValue('width', '200');
await inspectorHelper.testUndoRedo('width', '100', '200');

// Performance monitoring (Phase 4B)
await inspectorHelper.openPerformanceSection();
const metrics = await inspectorHelper.getPerformanceMetrics();

// Diagnostics (Phase 4B)
await inspectorHelper.openDiagnosticsSection();
const diagnostics = await inspectorHelper.getDiagnosticSuggestions();

// Configuration management (Phase 4B)
await inspectorHelper.exportConfiguration();
await inspectorHelper.verifyConfigurationExported();
```

## 📊 Test Data and Fixtures

### Using Test Scenarios

```typescript
import { NodeScenarios, WorkflowScenarios, TestScenarioHelper } from '../fixtures/test-scenarios';

// Use predefined scenarios
const boxScenario = NodeScenarios.standardBox;
const workflow = WorkflowScenarios.simpleBoxCylinder;

// Generate dynamic scenarios
const performanceTest = TestScenarioHelper.generatePerformanceScenario(10);
const paramVariant = TestScenarioHelper.createParameterVariant(
  NodeScenarios.standardBox,
  'width',
  200
);

// Random parameter generation
const validParam = TestScenarioHelper.getRandomValidParameter('width');
const invalidParam = TestScenarioHelper.getRandomInvalidParameter('radius');
```

### Mock Geometry for Reproducible Testing

```typescript
import { MockGeometryEngine, MockGeometryData } from '../fixtures/mock-geometry';

// Use mock engine for predictable results
const mockEngine = MockGeometryEngine.getInstance();
const result = await mockEngine.createGeometry('Solid::Box', { width: 100, height: 50, depth: 25 });

// Set custom response delays for performance testing
mockEngine.setResponseDelay(100); // 100ms delay

// Get performance metrics
const perfMetrics = mockEngine.getPerformanceMetrics(5); // 5 nodes
```

## 🎯 Best Practices

### 1. Test Organization

- Group related tests in describe blocks
- Use descriptive test names that explain the scenario
- Follow the Arrange-Act-Assert pattern
- Keep tests focused on single functionality

### 2. Reliability

- Always wait for elements to be ready before interaction
- Use appropriate timeouts for CAD operations (geometry can be slow)
- Reset viewport state between tests when needed
- Handle WebGL context initialization properly

### 3. Performance

- Use test data fixtures for consistent scenarios
- Batch similar operations to reduce test execution time
- Clean up resources between tests
- Monitor memory usage in long-running tests

### 4. Visual Testing

- Use consistent viewport settings for screenshot comparison
- Allow reasonable threshold for rendering variations (15%)
- Test different viewing angles and zoom levels
- Verify both solid and wireframe rendering modes

### 5. Error Handling

- Test both valid and invalid parameter combinations
- Verify error messages are helpful and actionable
- Test error recovery scenarios
- Ensure UI remains responsive during errors

## 📈 Performance Testing

### Viewport Performance

```typescript
test('Viewport maintains good performance', async ({ page }) => {
  // Create test geometry
  await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
  await nodeHelper.evaluateGraph();
  await viewportHelper.waitForGeometryRendered();

  // Test responsiveness
  await viewportHelper.verifyViewportResponsiveness(100); // <100ms

  // Get performance metrics
  const metrics = await viewportHelper.getPerformanceMetrics();
  expect(metrics.fps).toBeGreaterThan(30);
  expect(metrics.renderTime).toBeLessThan(50);

  // Stress test
  const stressResults = await viewportHelper.stressTestViewport(5000);
  expect(stressResults.averageFPS).toBeGreaterThan(15);
});
```

### Memory Usage Testing

```typescript
test('Memory usage remains stable', async ({ page }) => {
  const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

  // Perform operations
  for (let i = 0; i < 10; i++) {
    await nodeHelper.createBoxNode({ width: 50, height: 50, depth: 50 });
  }

  const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);

  const memoryGrowth = finalMemory - initialMemory;
  expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // <50MB
});
```

## 🔍 Visual Regression Testing

### Baseline Creation

```bash
# Create new visual baselines
pnpm test:e2e --update-snapshots

# Update specific test baselines
pnpm test:e2e tests/e2e/workflows/viewport-interaction-visual.test.ts --update-snapshots
```

### Visual Comparison

```typescript
test('Consistent rendering across sessions', async ({ page }) => {
  await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
  await nodeHelper.evaluateGraph();
  await viewportHelper.waitForGeometryRendered();

  // Reset to standard view
  await viewportHelper.resetCamera();
  await viewportHelper.fitAll();

  // Take baseline screenshot
  await viewportHelper.takeViewportScreenshot('baseline-standard-box.png');
});
```

## 🚨 Troubleshooting

### Common Issues

#### WebGL Context Issues

```typescript
// Check WebGL availability
const hasWebGL = await page.evaluate(() => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  return !!gl;
});

if (!hasWebGL) {
  test.skip('WebGL not available');
}
```

#### Timing Issues

```typescript
// Use proper waits for CAD operations
await viewportHelper.waitForGeometryRendered(); // Wait for 3D rendering
await nodeHelper.waitForEvaluation(); // Wait for graph evaluation
await page.waitForTimeout(500); // Last resort - fixed delay
```

#### Memory Leaks

```typescript
// Monitor memory growth
test.afterEach(async ({ page }) => {
  const memory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0);
  console.log(`Memory usage: ${(memory / 1024 / 1024).toFixed(2)} MB`);
});
```

### Debug Mode

```bash
# Run tests in debug mode
pnpm test:e2e:debug

# Or with headed browser
pnpm test:e2e:headed
```

## 📋 CI/CD Integration

### GitHub Actions

The framework includes automated CI/CD integration with:

- **E2E Tests**: Run on every push and PR
- **Visual Regression**: Automated on PRs with diff artifacts
- **Performance Tests**: Scheduled on main branch pushes
- **Artifact Collection**: Test reports, videos, and screenshots

### Configuration

See `.github/workflows/e2e-tests.yml` for the complete CI/CD setup.

### Local Development

```bash
# Run full test suite (unit + e2e)
pnpm test:all

# Check test configuration
npx playwright test --list
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [BrepFlow Architecture Guide](./technical/ARCHITECTURE.md)
- [Testing Strategy](./TESTING.md)
- [Contributing Guidelines](./development/CONTRIBUTING.md)

## 🤝 Contributing

When adding new tests:

1. Follow the established patterns in existing test files
2. Add appropriate test data to fixtures
3. Update this documentation for new features
4. Ensure tests are reliable and not flaky
5. Add proper error handling and cleanup

For complex test scenarios, consider creating new helper methods in the appropriate test helper classes.
