# Performance Monitoring and Metrics

Comprehensive performance monitoring system for BrepFlow to track, analyze, and optimize application performance.

## Overview

The BrepFlow performance monitoring system provides:

- **Real-time metrics collection** for DAG evaluation, geometry operations, viewport rendering, and memory usage
- **Performance budgets** with automated threshold detection
- **CI/CD regression testing** to prevent performance degradation
- **Export capabilities** for analytics and monitoring dashboards
- **Historical tracking** to identify trends and regressions

## Architecture

### Components

1. **PerformanceMonitor** (`packages/engine-core/src/performance-monitor.ts`)
   - Core metrics collection and threshold checking
   - Singleton instance for application-wide monitoring
   - Real-time FPS, memory, and timing measurements

2. **PerformanceReporter** (`packages/engine-core/src/performance-reporter.ts`)
   - Aggregates metrics over time
   - Detects threshold violations with severity levels
   - Exports to multiple destinations (console, JSON endpoints)

3. **EvaluationProfiler** (`packages/engine-core/src/diagnostics/evaluation-profiler.ts`)
   - Per-node DAG evaluation profiling
   - P50/P95/P99 percentile tracking
   - Slow node detection and categorization

4. **Performance Budgets** (`performance-budgets.json`)
   - Centralized budget configuration
   - Tiered thresholds (target/warning/critical)
   - CI/CD test definitions

## Key Metrics

### Application Load

- **Cold Start**: Time from navigation to interactive (`≤ 3000ms` target)
- **Hot Reload**: HMR update time (`≤ 500ms` target)
- **WASM Init**: OCCT WASM initialization (`≤ 800ms` target)

### DAG Evaluation

- **Per-Node Timing**: P50/P95/P99 percentiles
  - P50: `≤ 50ms` target
  - P95: `≤ 500ms` target
  - P99: `≤ 1000ms` target
- **Total Graph**: Depends on graph size
  - Small (<10 nodes): `≤ 500ms`
  - Medium (10-50 nodes): `≤ 2000ms`
  - Large (50+ nodes): `≤ 5000ms`

### Geometry Operations

- **Boolean Operations**: P95 `< 1000ms` for `< 50k faces`
- **BREP Operations**: Fillets `< 200ms`, Lofts `< 300ms`, Sweeps `< 250ms`
- **Mesh Generation**: `< 200ms` for `< 100k triangles`

### Viewport Rendering

- **FPS**: `≥ 60 FPS` target, `≥ 30 FPS` critical
- **Frame Time**: `≤ 16.67ms` (60 FPS)
- **Triangle Count**: `≤ 2M` comfortable, `≤ 5M` critical
- **Draw Calls**: `≤ 100` target

### Memory

- **Heap Usage**: `≤ 1000MB` comfortable, `≤ 2000MB` critical
- **WASM Memory**: `≤ 500MB` comfortable, `≤ 1000MB` critical
- **Total Per Tab**: `≤ 1500MB` comfortable, `≤ 2000MB` critical
- **Worker Memory**: `≤ 300MB` comfortable, `≤ 750MB` critical

### Cache Performance

- **Hit Rate**: `≥ 80%` target
- **Eviction Rate**: `≤ 5%` target

## Usage

### Basic Monitoring

```typescript
import { performanceMonitor } from '@brepflow/engine-core';

// Start timing measurement
const stopEval = performanceMonitor.startMeasure('evaluation');
// ... perform work ...
stopEval();

// Update metrics
performanceMonitor.updateGraphMetrics({
  nodeCount: 25,
  edgeCount: 40,
  dirtyNodes: 5,
  cacheHits: 100,
  cacheMisses: 20,
});

// Take snapshot
performanceMonitor.snapshot();

// Check thresholds
const { violations, warnings } = performanceMonitor.checkThresholds();
if (violations.length > 0) {
  console.warn('Performance violations:', violations);
}
```

### Performance Reporting

```typescript
import { PerformanceReporter, JSONPerformanceExporter } from '@brepflow/engine-core';

// Create reporter with exporters
const reporter = new PerformanceReporter(60000, [
  new JSONPerformanceExporter('https://analytics.example.com/metrics'),
]);

// Record metrics
reporter.recordMetrics(performanceMonitor.getMetrics());

// Start auto-export
reporter.startAutoExport(); // Exports every 60s

// Manual export
await reporter.exportReport();
```

### DAG Evaluation Profiling

```typescript
import { EvaluationProfiler } from '@brepflow/engine-core/diagnostics';

const profiler = new EvaluationProfiler();

// Record evaluation
profiler.record({
  nodeId: 'node-123',
  nodeType: 'Solid::Box',
  durationMs: 45.2,
  success: true,
  cacheHit: false,
  timestamp: Date.now(),
});

// Get summary
const summary = profiler.getSummary();
console.log(`P95 evaluation time: ${summary.p95Ms}ms`);
console.log(`Slow nodes:`, summary.slowNodes);
console.log(`Category breakdown:`, summary.categoryBreakdown);
```

### React Integration

```typescript
import { usePerformanceMonitor } from '@brepflow/engine-core';

function PerformancePanel() {
  const { metrics, reset, snapshot, report } = usePerformanceMonitor();

  return (
    <div>
      <h3>Performance Metrics</h3>
      <p>FPS: {metrics.fps.toFixed(0)}</p>
      <p>Evaluation: {metrics.evaluationTime.toFixed(1)}ms</p>
      <p>Memory: {metrics.heapUsed.toFixed(0)}MB</p>
      <p>Cache Hit Rate: {((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}%</p>

      <button onClick={snapshot}>Take Snapshot</button>
      <button onClick={reset}>Reset</button>
      <pre>{report()}</pre>
    </div>
  );
}
```

## Performance Budgets

Budgets are defined in `performance-budgets.json` with three threshold levels:

- **Target**: Ideal performance goal
- **Warning**: Acceptable but should be investigated
- **Critical**: Unacceptable, requires immediate attention

Example budget structure:

```json
{
  "runtimeBudgets": {
    "appLoad": {
      "coldStart": {
        "target": 3000,
        "warning": 2500,
        "critical": 3500
      }
    }
  }
}
```

## CI/CD Integration

### Running Performance Tests

```bash
# Run all performance regression tests
pnpm run test:performance

# Run specific performance test
pnpm run test:performance -- --grep "app cold load"

# Generate performance report
pnpm run test:performance -- --reporter=html
```

### CI Configuration

Performance tests run automatically in CI/CD on:

- Every commit to main/master
- Pull requests targeting main/master
- Nightly scheduled runs

Tests fail if:

- Any metric exceeds its critical threshold
- Regression > 10% from baseline
- 3+ consecutive violations in the same metric

### Baseline Management

```bash
# Capture performance baseline
pnpm run perf:baseline

# Compare current performance to baseline
pnpm run perf:compare

# Update baseline (after approved changes)
pnpm run perf:update-baseline
```

## Monitoring Dashboard

### Local Development

Access the performance dashboard at `http://localhost:5173/__performance` during development:

- Real-time metrics visualization
- Historical charts (FPS, memory, evaluation time)
- Threshold violation alerts
- Export capabilities (JSON, CSV)

### Production Monitoring

Performance metrics can be exported to:

- **Application Insights**: Azure Monitor integration
- **Datadog**: Custom metrics and dashboards
- **Grafana**: Time-series visualization
- **Custom endpoints**: JSON POST to analytics service

## Troubleshooting

### High Evaluation Time

**Symptoms**: `evaluationTime > 1000ms`

**Diagnosis**:

```typescript
const profiler = new EvaluationProfiler();
const summary = profiler.getSummary();
console.log('Slow nodes:', summary.slowNodes);
console.log('Category breakdown:', summary.categoryBreakdown);
```

**Solutions**:

- Check for expensive geometry operations in slow nodes
- Verify cache is being utilized (check `cacheHitRate`)
- Consider parallelization for independent nodes
- Profile WASM worker time vs. main thread time

### Low FPS

**Symptoms**: `fps < 30`

**Diagnosis**:

```typescript
const metrics = performanceMonitor.getMetrics();
console.log('Triangle count:', metrics.triangleCount);
console.log('Draw calls:', metrics.drawCalls);
console.log('Frame time:', metrics.frameTime);
```

**Solutions**:

- Reduce triangle count through LOD or culling
- Batch draw calls to reduce state changes
- Enable geometry instancing for repeated objects
- Check for excessive re-renders in React components

### High Memory Usage

**Symptoms**: `heapUsed > 1500MB`

**Diagnosis**:

```typescript
// Take heap snapshot before and after operations
performanceMonitor.snapshot();
// ... perform operations ...
performanceMonitor.snapshot();

const history = performanceMonitor.getHistory();
const memoryDelta = history[history.length - 1].heapUsed - history[history.length - 2].heapUsed;
console.log('Memory increase:', memoryDelta, 'MB');
```

**Solutions**:

- Check for memory leaks in event listeners
- Verify geometry cache eviction is working
- Clear unused worker memory
- Force garbage collection after large operations

### Cache Thrashing

**Symptoms**: `cacheHitRate < 40%`

**Diagnosis**:

```typescript
const metrics = performanceMonitor.getMetrics();
const hitRate = (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100;
console.log('Cache hit rate:', hitRate.toFixed(1), '%');
```

**Solutions**:

- Increase cache size if memory allows
- Check for unnecessary node re-evaluations
- Verify content-addressed hashing is deterministic
- Review cache eviction policy (LRU vs. LFU)

## Best Practices

### 1. Measure Everything

Add performance measurements to all critical code paths:

```typescript
// DAG evaluation
const stopEval = performanceMonitor.startMeasure('evaluation');
const result = await engine.evaluate(graphId);
stopEval();

// Geometry operations
const stopWorker = performanceMonitor.startMeasure('worker');
const shape = await occtWorker.makeBox(10, 10, 10);
stopWorker();

// Rendering
const stopRender = performanceMonitor.startMeasure('render');
renderer.render(scene, camera);
stopRender();
```

### 2. Set Realistic Budgets

Start with measured baseline and set budgets based on actual performance:

```bash
# Measure baseline
pnpm run perf:measure-baseline

# Set budgets at P95 + 20% margin
pnpm run perf:set-budgets --from-baseline --margin=20
```

### 3. Monitor in Production

Export metrics to analytics platform:

```typescript
const reporter = new PerformanceReporter(60000, [
  new JSONPerformanceExporter(process.env.ANALYTICS_ENDPOINT),
]);

reporter.startAutoExport();
```

### 4. Regular Performance Reviews

- Weekly: Review performance dashboard for trends
- Monthly: Update budgets based on real-world data
- Quarterly: Audit and optimize bottlenecks

### 5. Performance Testing in CI

Add performance tests for new features:

```typescript
test('new feature meets performance budget', async ({ page }) => {
  const { duration } = await page.evaluate(async () => {
    const start = performance.now();
    await newFeature.execute();
    return { duration: performance.now() - start };
  });

  expect(duration).toBeLessThan(NEW_FEATURE_BUDGET);
});
```

## API Reference

See:

- [PerformanceMonitor API](../api/PerformanceMonitor.md)
- [PerformanceReporter API](../api/PerformanceReporter.md)
- [EvaluationProfiler API](../api/EvaluationProfiler.md)

## Related Documentation

- [Performance Budgets](./PERFORMANCE_BUDGETS.md)
- [CI/CD Performance Testing](../ci-cd/PERFORMANCE_TESTING.md)
- [Optimization Guide](./OPTIMIZATION_GUIDE.md)
- [Memory Management](./MEMORY_MANAGEMENT.md)
