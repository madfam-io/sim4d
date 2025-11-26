# Performance Regression Testing Implementation Plan

**Date**: 2025-11-17  
**Status**: 🚧 In Progress (2/7 tasks complete)  
**Priority**: 2 (High Impact, Medium Effort)

## Overview

Implementing automated performance benchmarking to track and prevent regressions as the codebase grows. This ensures Sim4D maintains its performance targets over time.

## Performance Targets

| Metric                               | Target   | Warning    | Critical |
| ------------------------------------ | -------- | ---------- | -------- |
| **App Cold Load**                    | ≤ 3.0s   | 2.5-3.0s   | > 3.0s   |
| **Viewport FPS (≤2M triangles)**     | ≥ 60 FPS | 55-60 FPS  | < 55 FPS |
| **Boolean Operations (< 50k faces)** | < 1s p95 | 1-1.5s     | > 1.5s   |
| **Memory per Tab**                   | < 1.5 GB | 1.5-2.0 GB | > 2.0 GB |

## Implementation Status

### ✅ Completed (2/7)

**1. App Load Performance Tests** (`tests/performance/app-load.perf.test.ts`)

- Cold load time measurement
- Regression detection (10% threshold)
- WASM worker initialization timing
- Dev server response time
- Critical resource loading analysis

**2. Viewport FPS Tests** (`tests/performance/viewport-fps.perf.test.ts`)

- Empty scene FPS baseline
- Simple geometry (1K triangles)
- Moderate geometry (100K triangles)
- Target load (2M triangles)
- Camera rotation performance
- Memory usage monitoring
- FPS regression detection

### 🚧 Remaining Tasks (5/7)

**3. OCCT Operation Timing Benchmarks**

Create `tests/performance/occt-operations.perf.test.ts`:

```typescript
// Boolean operations
test('Boolean union performance', async () => {
  // Measure: create box + cylinder + union
  // Target: < 1s p95 for parts < 50k faces
});

test('Boolean subtraction performance', async () => {
  // Measure: create box + sphere + subtract
  // Target: < 1s p95
});

// Extrusion operations
test('Extrusion performance', async () => {
  // Measure: create profile + extrude
  // Target: < 500ms for simple profiles
});

// Fillet operations
test('Fillet performance', async () => {
  // Measure: create box + add fillets
  // Target: < 2s for 8 edges
});

// STEP export
test('STEP export performance', async () => {
  // Measure: export complex model
  // Target: < 5s for moderate complexity
});
```

**4. CI/CD Integration**

Update `.github/workflows/test-docker.yml`:

```yaml
performance-tests:
  name: Performance Tests
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'

  steps:
    - uses: actions/checkout@v5

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: '20.11.1'

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build application
      run: pnpm build

    - name: Install Playwright
      run: npx playwright install --with-deps chromium

    - name: Start dev server
      run: pnpm --filter @sim4d/studio run dev --port 5173 &

    - name: Wait for server
      run: timeout 120 bash -c 'until curl -f http://localhost:5173; do sleep 2; done'

    - name: Run performance tests
      run: pnpm exec playwright test tests/performance/ --reporter=html
      env:
        CI: true

    - name: Upload performance report
      uses: actions/upload-artifact@v5
      if: always()
      with:
        name: performance-report
        path: playwright-report/

    - name: Check for performance regressions
      run: node scripts/check-performance-regressions.js
```

**5. Performance Regression Alert System**

Create `scripts/check-performance-regressions.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Load baselines
const baselinesPath = path.join(__dirname, '../performance-metrics/baselines.json');
const baselines = JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));

// Load latest metrics
const metricsDir = path.join(__dirname, '../performance-metrics');
const metrics = {};

for (const file of fs.readdirSync(metricsDir)) {
  if (!file.endsWith('.json') || file === 'baselines.json') continue;

  const metricName = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(metricsDir, file), 'utf8'));

  if (data.length > 0) {
    metrics[metricName] = data[data.length - 1].value;
  }
}

// Check for regressions
const REGRESSION_THRESHOLD = 0.1; // 10%
let hasRegressions = false;

console.log('\n📊 Performance Regression Check\n');
console.log('═══════════════════════════════════════════════════════════\n');

for (const [metric, baseline] of Object.entries(baselines)) {
  const current = metrics[metric];

  if (!current) {
    console.log(`⚠️  ${metric}: No current measurement`);
    continue;
  }

  const change = (current - baseline) / baseline;
  const changePercent = (change * 100).toFixed(2);

  // Determine if this is a regression
  const isRegression = change > REGRESSION_THRESHOLD;
  const isImprovement = change < -0.05; // 5% improvement

  if (isRegression) {
    console.log(`❌ ${metric}:`);
    console.log(`   Baseline: ${baseline.toFixed(2)}`);
    console.log(`   Current:  ${current.toFixed(2)}`);
    console.log(`   Change:   +${changePercent}% (regression)`);
    hasRegressions = true;
  } else if (isImprovement) {
    console.log(`✅ ${metric}:`);
    console.log(`   Baseline: ${baseline.toFixed(2)}`);
    console.log(`   Current:  ${current.toFixed(2)}`);
    console.log(`   Change:   ${changePercent}% (improvement)`);
  } else {
    console.log(`✓  ${metric}: ${changePercent}% (within threshold)`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');

if (hasRegressions) {
  console.log('❌ Performance regressions detected!');
  process.exit(1);
} else {
  console.log('✅ No performance regressions detected');
  process.exit(0);
}
```

**6. Performance Metrics Visualization**

Create `scripts/generate-performance-report.js`:

```javascript
// Generate HTML report with charts showing performance trends
// Use Chart.js or similar to visualize metrics over time
// Include:
// - Load time trends
// - FPS trends by complexity
// - OCCT operation timing trends
// - Memory usage trends
```

Update GitHub workflow to publish reports:

```yaml
- name: Generate performance report
  run: node scripts/generate-performance-report.js

- name: Publish to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./performance-reports
    destination_dir: performance
```

**7. Documentation**

Create `docs/testing/PERFORMANCE_TESTING.md`:

````markdown
# Performance Testing Guide

## Running Performance Tests

\`\`\`bash

# Run all performance tests

pnpm exec playwright test tests/performance/

# Run specific test suite

pnpm exec playwright test tests/performance/app-load.perf.test.ts

# Run with UI

pnpm exec playwright test tests/performance/ --ui
\`\`\`

## Understanding Results

### App Load Time

- Target: ≤ 3.0s
- Measured from navigation to interactive
- Includes WASM worker initialization

### Viewport FPS

- Target: ≥ 60 FPS for ≤ 2M triangles
- Measured over 5-10 second window
- Tested at various complexity levels

### OCCT Operations

- Boolean operations: < 1s p95
- Extrusion: < 500ms
- Fillets: < 2s
- STEP export: < 5s

## Baseline Management

### Establishing Baselines

\`\`\`bash

# Run tests to establish baseline

pnpm exec playwright test tests/performance/

# Baselines stored in: performance-metrics/baselines.json

\`\`\`

### Updating Baselines

When legitimate performance improvements are made:

\`\`\`bash

# Manually update baselines after verifying improvements

node scripts/update-performance-baselines.js
\`\`\`

## CI/CD Integration

Performance tests run automatically:

- On push to main branch
- Weekly scheduled runs
- Manual workflow dispatch

## Troubleshooting

### High Variability

- Run tests multiple times
- Check for background processes
- Verify consistent test environment

### False Positives

- Review trend data in performance-metrics/
- Consider increasing regression threshold
- Check for test flakiness
  \`\`\`

## Quick Start (Completing Implementation)

### Step 1: Create OCCT Operation Tests

```bash
# Create the file
touch tests/performance/occt-operations.perf.test.ts

# Copy the template above and implement each test
# Focus on measuring actual OCCT operations with real geometry
```
````

### Step 2: Integrate with CI/CD

```bash
# Edit .github/workflows/test-docker.yml
# Add the performance-tests job (template above)
```

### Step 3: Create Regression Check Script

```bash
# Create script
touch scripts/check-performance-regressions.js

# Copy template above
chmod +x scripts/check-performance-regressions.js
```

### Step 4: Add Visualization (Optional)

```bash
# Create report generator
touch scripts/generate-performance-report.js

# Implement HTML report generation with Chart.js
```

### Step 5: Document Everything

```bash
# Create guide
touch docs/testing/PERFORMANCE_TESTING.md

# Copy template above and customize
```

## Expected Timeline

- **OCCT Operation Tests**: 2-3 hours
- **CI/CD Integration**: 1 hour
- **Regression Alerts**: 1 hour
- **Visualization**: 2-3 hours (optional)
- **Documentation**: 1 hour

**Total**: 6-9 hours remaining

## Success Criteria

- [x] App load performance tests created
- [x] Viewport FPS tests created
- [ ] OCCT operation tests created
- [ ] Performance tests integrated into CI/CD
- [ ] Regression detection system working
- [ ] Performance metrics stored and tracked
- [ ] Documentation complete
- [ ] All tests passing with current baselines

## Benefits

Once complete, you'll have:

1. **Automated Detection**: Catch performance regressions before they reach users
2. **Trend Analysis**: Track performance over time with metrics storage
3. **CI/CD Gates**: Block PRs that cause significant performance degradation
4. **Visibility**: Performance dashboards and reports
5. **Confidence**: Know performance targets are maintained as features are added

## Next Steps After Completion

1. **Monitor Initial Runs**: Watch first few weeks of data collection
2. **Tune Thresholds**: Adjust regression thresholds based on variability
3. **Expand Coverage**: Add more operation types as needed
4. **Optimize**: Use performance data to guide optimization efforts

---

**Status**: 2/7 tasks complete  
**Priority**: Continue implementation to completion  
**Estimated Time Remaining**: 6-9 hours
