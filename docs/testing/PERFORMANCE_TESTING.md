# Performance Testing Guide

## Overview

BrepFlow's performance testing infrastructure ensures the application maintains acceptable performance characteristics across releases. This guide covers running tests, interpreting results, managing baselines, and troubleshooting issues.

## Performance Targets

| Metric                | Target   | P95 Target | Test Suite                     |
| --------------------- | -------- | ---------- | ------------------------------ |
| App Cold Load         | ≤ 3.0s   | ≤ 3.5s     | `app-load.perf.test.ts`        |
| Viewport FPS (2M tri) | ≥ 60 FPS | ≥ 55 FPS   | `viewport-fps.perf.test.ts`    |
| Boolean Operations    | < 1.0s   | < 1.2s     | `occt-operations.perf.test.ts` |
| Memory Usage          | < 2.0 GB | < 2.2 GB   | `viewport-fps.perf.test.ts`    |

## Running Performance Tests

### Local Execution

```bash
# Run all performance tests
pnpm run test:e2e tests/performance/

# Run specific test suite
pnpm exec playwright test tests/performance/app-load.perf.test.ts
pnpm exec playwright test tests/performance/viewport-fps.perf.test.ts
pnpm exec playwright test tests/performance/occt-operations.perf.test.ts

# Run with visible browser (for debugging)
pnpm exec playwright test tests/performance/ --headed

# Run with HTML report
pnpm exec playwright test tests/performance/ --reporter=html
```

### CI/CD Execution

Performance tests run automatically on:

- **Push to `main` branch**: Full performance test suite with regression detection
- **Weekly schedule**: Comprehensive performance audit with trend analysis

```yaml
# Triggered by:
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1' # Every Monday at 2 AM UTC
```

### Docker Execution

```bash
# Run performance tests in Docker (matches CI environment)
./scripts/docker-dev.sh test:e2e tests/performance/
```

## Understanding Test Results

### Test Output Format

```
✅ app-load.perf.test.ts:15:5 › cold load time should be under 3.0 seconds
   Duration: 2847ms
   Baseline: 2923ms (median of last 10 runs)
   Change: -2.6% (improvement)
   Status: PASS ✅

⚠️ viewport-fps.perf.test.ts:42:5 › FPS with 2M triangles should be >= 60 FPS
   FPS: 57.3
   Baseline: 61.2 FPS
   Change: -6.4% (within threshold)
   Status: WARNING ⚠️

❌ occt-operations.perf.test.ts:89:5 › Boolean union operation performance
   Duration: 1342ms
   Baseline: 987ms
   Change: +36.0% (regression detected)
   Status: FAIL - REGRESSION ❌
```

### Metric Storage

Metrics are stored in `performance-metrics/` directory:

```
performance-metrics/
├── app_cold_load_ms.json          # App load time history
├── viewport_fps_2m.json           # Viewport FPS with 2M triangles
├── occt_boolean_union_ms.json     # Boolean union timing
├── occt_extrude_ms.json           # Extrusion timing
├── memory_usage_mb.json           # Memory consumption
└── baselines.json                 # Current baselines for all metrics
```

**Metric File Format**:

```json
{
  "metric": "app_cold_load_ms",
  "measurements": [
    {
      "timestamp": "2025-11-17T10:30:45Z",
      "value": 2847,
      "commit": "abc123def",
      "environment": "ci"
    }
  ]
}
```

## Baseline Management

### What is a Baseline?

A baseline is the median of the last 10 measurements for a metric. It represents the "expected" performance and is used to detect regressions.

### How Baselines Work

1. **Initial Establishment**: First 10 measurements establish the initial baseline
2. **Rolling Updates**: Baseline recalculates with each new measurement (median of last 10)
3. **Regression Detection**: New measurements compared against current baseline with 10% threshold

### Viewing Current Baselines

```bash
# View all baselines
cat performance-metrics/baselines.json

# Example output:
{
  "app_cold_load_ms": {
    "value": 2923,
    "updated": "2025-11-17T10:30:45Z",
    "measurements": 47,
    "trend": "stable"
  }
}
```

### Updating Baselines

Baselines update automatically with each test run. Manual baseline reset is rarely needed but available:

```bash
# Reset all baselines (use with caution)
rm performance-metrics/baselines.json

# Reset specific metric
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('performance-metrics/baselines.json'));
delete data['app_cold_load_ms'];
fs.writeFileSync('performance-metrics/baselines.json', JSON.stringify(data, null, 2));
"
```

**When to Reset Baselines**:

- ✅ After intentional performance improvements (document in commit message)
- ✅ After infrastructure changes (new hardware, Node.js version)
- ❌ To hide regressions (investigate root cause instead)
- ❌ After temporary anomalies (baselines self-correct over 10 runs)

## Regression Detection

### Threshold Rules

```javascript
const REGRESSION_THRESHOLD = 0.1; // 10% degradation

// For "lower is better" metrics (e.g., load time, operation duration)
isRegression = (current - baseline) / baseline > 0.1;

// For "higher is better" metrics (e.g., FPS)
isRegression = (baseline - current) / baseline > 0.1;
```

### Severity Levels

| Change                | Classification         | Action                            |
| --------------------- | ---------------------- | --------------------------------- |
| > +10% (lower better) | 🔴 Critical Regression | Blocks PR, requires investigation |
| +5% to +10%           | ⚠️ Warning             | Review recommended                |
| -5% to +5%            | ✅ Stable              | No action needed                  |
| < -5%                 | 🎉 Improvement         | Document and celebrate            |

### CI/CD Integration

```bash
# Regression check runs automatically in CI
node scripts/check-performance-regressions.js

# Exit codes:
# 0 = No regressions
# 1 = Critical regressions detected (blocks PR)
# 2 = Warnings only (informational)
```

## Performance Report

### Generating Reports

```bash
# Generate HTML performance report
node scripts/generate-performance-report.js

# Output: performance-report/index.html
# View: open performance-report/index.html
```

### Report Contents

The HTML report includes:

1. **Summary Statistics**
   - Current value vs baseline
   - Trend indicator (improving/stable/degrading)
   - Target comparison
   - Status badge

2. **Trend Charts**
   - Last 30 measurements visualized
   - Baseline reference line
   - Target threshold line
   - Color-coded zones (green/yellow/red)

3. **Metadata**
   - Generated timestamp
   - Git commit hash
   - Total measurements
   - Environment info

### Publishing Reports

Reports are automatically published to GitHub Pages on every `main` branch push:

```yaml
# .github/workflows/test-docker.yml
- name: Deploy performance report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./performance-report
```

**View Reports**: `https://<org>.github.io/brepflow/performance-report/`

## Troubleshooting

### High Variability in Results

**Symptom**: Performance tests show large fluctuations between runs

**Causes**:

- Background processes consuming CPU/memory
- Browser extensions interfering with timing
- Network latency for WASM module loading
- Thermal throttling on laptops

**Solutions**:

```bash
# 1. Run in Docker (isolated environment)
./scripts/docker-dev.sh test:e2e tests/performance/

# 2. Increase measurement samples
# Edit test file to run more iterations:
const MEASUREMENT_DURATION_MS = 10000; // Increase from 5000

# 3. Use headless mode (less overhead)
pnpm exec playwright test tests/performance/ --headed=false

# 4. Close other applications
# Ensure 70%+ free memory before running tests
```

### False Positive Regressions

**Symptom**: CI reports regression, but no code changes affect performance

**Causes**:

- Insufficient baseline history (< 10 measurements)
- One-time infrastructure anomaly
- Variance in CI runner hardware

**Solutions**:

```bash
# 1. Check baseline history
cat performance-metrics/app_cold_load_ms.json | jq '.measurements | length'

# 2. Re-run test 3-5 times to establish stability
for i in {1..5}; do
  pnpm exec playwright test tests/performance/app-load.perf.test.ts
done

# 3. Review trend in HTML report
node scripts/generate-performance-report.js
open performance-report/index.html
```

### WASM Worker Timeout

**Symptom**: OCCT operation tests fail with timeout errors

**Causes**:

- WASM module not loaded
- Worker initialization failure
- Complex geometry exceeding timeout

**Solutions**:

```typescript
// Increase timeout in test file
test('Boolean union operation performance', async ({ page }) => {
  test.setTimeout(60000); // Increase from 30000

  // Add explicit WASM ready check
  await page.waitForFunction(
    () => {
      return (window as any).__GEOMETRY_API__?.isReady === true;
    },
    { timeout: 10000 }
  );
});
```

### Memory Leak Detection

**Symptom**: Memory usage grows over multiple test runs

**Diagnostic Steps**:

```typescript
// Add memory snapshot to test
test('Memory usage check', async ({ page }) => {
  const memoryBefore = await page.evaluate(() => {
    return (performance as any).memory?.usedJSHeapSize || 0;
  });

  // Run test operations...

  const memoryAfter = await page.evaluate(() => {
    return (performance as any).memory?.usedJSHeapSize || 0;
  });

  const leakMB = (memoryAfter - memoryBefore) / (1024 * 1024);
  console.log(`Memory delta: ${leakMB.toFixed(2)} MB`);

  expect(leakMB).toBeLessThan(50); // Allow 50 MB growth
});
```

### CI-Only Failures

**Symptom**: Tests pass locally but fail in CI

**Causes**:

- Different Node.js/browser versions
- CI runner hardware differences
- Timing-sensitive tests affected by slower hardware

**Solutions**:

```bash
# 1. Match CI environment exactly with Docker
./scripts/docker-dev.sh test:e2e tests/performance/

# 2. Adjust thresholds for CI (if necessary)
# In test file:
const IS_CI = process.env.CI === 'true';
const COLD_LOAD_TARGET_MS = IS_CI ? 3500 : 3000; // More lenient in CI

# 3. Check CI logs for specific errors
gh run view --log-failed
```

## Best Practices

### 1. Run Performance Tests Regularly

```bash
# Daily (during active development)
pnpm exec playwright test tests/performance/ --reporter=html

# Review trends weekly
node scripts/generate-performance-report.js
open performance-report/index.html
```

### 2. Annotate Intentional Changes

When making changes that affect performance, document expectations:

```bash
git commit -m "perf: optimize viewport rendering with frustum culling

Expected impact:
- Viewport FPS: +15-20% improvement
- Memory usage: -10% reduction

Baseline updates will reflect this improvement over next 10 runs."
```

### 3. Investigate Before Resetting Baselines

Always investigate regressions before accepting them as new baselines:

```bash
# 1. Check what changed
git log --oneline -10

# 2. Profile the specific operation
pnpm exec playwright test tests/performance/app-load.perf.test.ts --headed --debug

# 3. Compare with previous commit
git checkout HEAD~1
pnpm exec playwright test tests/performance/
git checkout -
```

### 4. Monitor Trends, Not Single Points

Performance is inherently variable. Focus on trends over 10-20 measurements rather than individual data points.

### 5. Use Docker for Consistency

For reproducible results, always use Docker execution:

```bash
# Local development with Docker
./scripts/docker-dev.sh test:e2e tests/performance/

# This matches CI environment exactly
```

## Integration with Development Workflow

### Pre-Commit Performance Check

```bash
# Add to .git/hooks/pre-commit (optional)
#!/bin/bash
echo "Running performance smoke tests..."
pnpm exec playwright test tests/performance/app-load.perf.test.ts --quiet

if [ $? -ne 0 ]; then
  echo "⚠️ Performance test failed - review before committing"
  exit 1
fi
```

### PR Review Checklist

When reviewing PRs with performance impact:

- [ ] Check performance test results in CI artifacts
- [ ] Review regression warnings (even if below 10% threshold)
- [ ] Verify expected performance impact matches actual measurements
- [ ] Check memory usage hasn't increased significantly
- [ ] Ensure baselines will update appropriately over next 10 runs

### Release Validation

Before each release, run comprehensive performance audit:

```bash
# 1. Generate fresh performance report
node scripts/generate-performance-report.js

# 2. Review all metrics vs targets
open performance-report/index.html

# 3. Document any accepted regressions in release notes
# 4. Verify no critical performance issues blocking release
```

## Metrics Reference

### App Load Time (`app_cold_load_ms`)

**What it measures**: Time from initial page load to fully interactive UI

**Components**:

- Network requests (HTML, JS, WASM modules)
- JavaScript parsing and execution
- React component mounting
- WASM worker initialization
- Initial viewport render

**Target**: ≤ 3.0s on modern hardware (2020+ laptop)

**Optimization strategies**:

- Code splitting and lazy loading
- WASM module preloading
- Service worker caching
- Bundle size reduction

### Viewport FPS (`viewport_fps_*`)

**What it measures**: Sustained frame rate during viewport interactions

**Test scenarios**:

- Empty scene (baseline)
- 1K triangles (simple geometry)
- 100K triangles (moderate complexity)
- 2M triangles (stress test)
- Camera rotation (continuous motion)

**Target**: ≥ 60 FPS for scenes up to 2M triangles

**Optimization strategies**:

- Level-of-detail (LOD) systems
- Frustum culling
- Instanced rendering
- GPU-accelerated mesh operations

### OCCT Operations (`occt_*_ms`)

**What it measures**: Time for WASM geometry operations to complete

**Operations tested**:

- Boolean union/subtract/intersect
- Extrusion (linear and rotational)
- Fillets and chamfers
- STEP/STL file export
- Complex boolean chains

**Target**: < 1.0s p95 for parts with < 50k faces

**Optimization strategies**:

- Worker pooling
- Operation caching
- Geometry simplification
- Incremental mesh updates

### Memory Usage (`memory_usage_mb`)

**What it measures**: JavaScript heap size + GPU memory consumption

**Components**:

- React component state
- Three.js geometries and materials
- WASM heap (geometry kernel)
- Texture atlases and shaders
- Undo/redo history

**Target**: < 2.0 GB per browser tab

**Optimization strategies**:

- LRU caches for meshes
- Texture compression
- Geometry disposal
- Undo history limits

## Additional Resources

- **Performance Testing Implementation Plan**: `claudedocs/PERFORMANCE_TESTING_IMPLEMENTATION_PLAN.md`
- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/
- **Web Performance APIs**: https://developer.mozilla.org/en-US/docs/Web/API/Performance

## Support

For performance testing issues or questions:

1. Check this guide and troubleshooting section
2. Review CI logs for detailed error messages
3. Generate HTML report for visual trend analysis
4. Open GitHub issue with reproduction steps and performance report
