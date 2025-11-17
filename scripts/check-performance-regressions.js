#!/usr/bin/env node
/**
 * Performance Regression Checker
 * Compares current performance metrics against established baselines
 * Exits with error code 1 if regressions detected
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REGRESSION_THRESHOLD = 0.1; // 10% degradation allowed
const IMPROVEMENT_THRESHOLD = 0.05; // 5% improvement to report

const METRIC_DEFINITIONS = {
  // App Load Metrics (lower is better)
  app_cold_load_ms: { target: 3000, direction: 'lower', unit: 'ms', name: 'App Cold Load' },
  wasm_init_ms: { target: 2000, direction: 'lower', unit: 'ms', name: 'WASM Init' },
  server_response_ms: { target: 500, direction: 'lower', unit: 'ms', name: 'Server Response' },

  // Viewport FPS Metrics (higher is better)
  viewport_fps_empty: {
    target: 60,
    direction: 'higher',
    unit: 'FPS',
    name: 'Viewport FPS (Empty)',
  },
  viewport_fps_1k: { target: 60, direction: 'higher', unit: 'FPS', name: 'Viewport FPS (1K tri)' },
  viewport_fps_100k: {
    target: 60,
    direction: 'higher',
    unit: 'FPS',
    name: 'Viewport FPS (100K tri)',
  },
  viewport_fps_2m: { target: 60, direction: 'higher', unit: 'FPS', name: 'Viewport FPS (2M tri)' },
  viewport_fps_rotation: {
    target: 50,
    direction: 'higher',
    unit: 'FPS',
    name: 'Viewport FPS (Rotation)',
  },

  // Memory Metrics (lower is better)
  viewport_memory_mb: { target: 1500, direction: 'lower', unit: 'MB', name: 'Viewport Memory' },

  // OCCT Operation Metrics (lower is better)
  occt_boolean_union_ms: {
    target: 1000,
    direction: 'lower',
    unit: 'ms',
    name: 'OCCT Boolean Union',
  },
  occt_boolean_subtract_ms: {
    target: 1000,
    direction: 'lower',
    unit: 'ms',
    name: 'OCCT Boolean Subtract',
  },
  occt_boolean_intersect_ms: {
    target: 1000,
    direction: 'lower',
    unit: 'ms',
    name: 'OCCT Boolean Intersect',
  },
  occt_extrusion_ms: { target: 500, direction: 'lower', unit: 'ms', name: 'OCCT Extrusion' },
  occt_fillet_ms: { target: 2000, direction: 'lower', unit: 'ms', name: 'OCCT Fillet' },
  occt_step_export_ms: { target: 5000, direction: 'lower', unit: 'ms', name: 'OCCT STEP Export' },
  occt_stl_export_ms: { target: 5000, direction: 'lower', unit: 'ms', name: 'OCCT STL Export' },
  occt_boolean_chain_ms: {
    target: 4000,
    direction: 'lower',
    unit: 'ms',
    name: 'OCCT Boolean Chain',
  },
};

// Load baselines
function loadBaselines() {
  const baselinesPath = path.join(__dirname, '../performance-metrics/baselines.json');

  if (!fs.existsSync(baselinesPath)) {
    console.log('⚠️  No baseline file found - establishing baselines from current run');
    return {};
  }

  const data = fs.readFileSync(baselinesPath, 'utf8');
  return JSON.parse(data);
}

// Load latest metrics
function loadLatestMetrics() {
  const metricsDir = path.join(__dirname, '../performance-metrics');
  const metrics = {};

  if (!fs.existsSync(metricsDir)) {
    console.error('❌ Performance metrics directory not found');
    process.exit(1);
  }

  for (const file of fs.readdirSync(metricsDir)) {
    if (!file.endsWith('.json') || file === 'baselines.json') continue;

    const metricName = file.replace('.json', '');
    const filePath = path.join(metricsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.length > 0) {
      // Get the most recent measurement
      metrics[metricName] = data[data.length - 1].value;
    }
  }

  return metrics;
}

// Check if a metric is a regression
function isRegression(metric, baseline, current, definition) {
  if (definition.direction === 'lower') {
    // Lower is better (e.g., load time)
    const change = (current - baseline) / baseline;
    return change > REGRESSION_THRESHOLD;
  } else {
    // Higher is better (e.g., FPS)
    const change = (baseline - current) / baseline;
    return change > REGRESSION_THRESHOLD;
  }
}

// Check if a metric is an improvement
function isImprovement(metric, baseline, current, definition) {
  if (definition.direction === 'lower') {
    // Lower is better
    const change = (baseline - current) / baseline;
    return change > IMPROVEMENT_THRESHOLD;
  } else {
    // Higher is better
    const change = (current - baseline) / baseline;
    return change > IMPROVEMENT_THRESHOLD;
  }
}

// Calculate percentage change
function calculateChange(baseline, current, definition) {
  if (definition.direction === 'lower') {
    return ((current - baseline) / baseline) * 100;
  } else {
    return ((current - baseline) / baseline) * 100;
  }
}

// Check if metric meets target
function meetsTarget(value, definition) {
  if (definition.direction === 'lower') {
    return value <= definition.target;
  } else {
    return value >= definition.target;
  }
}

// Main execution
function main() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('           Performance Regression Check');
  console.log('════════════════════════════════════════════════════════════════\n');

  const baselines = loadBaselines();
  const metrics = loadLatestMetrics();

  if (Object.keys(metrics).length === 0) {
    console.error('❌ No performance metrics found');
    console.error('   Run performance tests first: pnpm exec playwright test tests/performance/');
    process.exit(1);
  }

  let hasRegressions = false;
  let hasCriticalRegressions = false;
  const improvements = [];
  const regressions = [];
  const stable = [];
  const targetFailures = [];

  // Analyze each metric
  for (const [metricName, current] of Object.entries(metrics)) {
    const definition = METRIC_DEFINITIONS[metricName];
    if (!definition) continue; // Skip unknown metrics

    const baseline = baselines[metricName];

    // Check if metric meets target
    if (!meetsTarget(current, definition)) {
      targetFailures.push({
        name: definition.name,
        current,
        target: definition.target,
        unit: definition.unit,
      });
    }

    if (!baseline) {
      // No baseline yet, this is our first run
      console.log(
        `📊 ${definition.name}: ${current.toFixed(2)}${definition.unit} (baseline established)`
      );
      continue;
    }

    const change = calculateChange(baseline, current, definition);
    const changeAbs = Math.abs(change);

    if (isRegression(metricName, baseline, current, definition)) {
      hasRegressions = true;

      // Check if it's critical (exceeds target significantly)
      if (!meetsTarget(current, definition)) {
        hasCriticalRegressions = true;
      }

      regressions.push({
        name: definition.name,
        baseline,
        current,
        change,
        unit: definition.unit,
        critical: !meetsTarget(current, definition),
      });
    } else if (isImprovement(metricName, baseline, current, definition)) {
      improvements.push({
        name: definition.name,
        baseline,
        current,
        change,
        unit: definition.unit,
      });
    } else {
      stable.push({
        name: definition.name,
        change: changeAbs,
        unit: definition.unit,
      });
    }
  }

  // Report improvements
  if (improvements.length > 0) {
    console.log('✅ Performance Improvements:\n');
    improvements.forEach((item) => {
      console.log(`   ${item.name}:`);
      console.log(`      Baseline: ${item.baseline.toFixed(2)}${item.unit}`);
      console.log(`      Current:  ${item.current.toFixed(2)}${item.unit}`);
      console.log(`      Change:   ${item.change.toFixed(2)}% (improved)`);
      console.log('');
    });
  }

  // Report regressions
  if (regressions.length > 0) {
    console.log('❌ Performance Regressions Detected:\n');
    regressions.forEach((item) => {
      const icon = item.critical ? '🚨' : '⚠️';
      console.log(`   ${icon} ${item.name}:`);
      console.log(`      Baseline: ${item.baseline.toFixed(2)}${item.unit}`);
      console.log(`      Current:  ${item.current.toFixed(2)}${item.unit}`);
      console.log(`      Change:   +${item.change.toFixed(2)}% (regression)`);
      if (item.critical) {
        console.log(`      Status:   CRITICAL - exceeds target`);
      }
      console.log('');
    });
  }

  // Report stable metrics
  if (stable.length > 0) {
    console.log(`✓  Stable Metrics (${stable.length} total):\n`);
    stable.slice(0, 5).forEach((item) => {
      console.log(`   ${item.name}: ${item.change.toFixed(2)}% change (within threshold)`);
    });
    if (stable.length > 5) {
      console.log(`   ... and ${stable.length - 5} more`);
    }
    console.log('');
  }

  // Report target failures
  if (targetFailures.length > 0) {
    console.log('⚠️  Metrics Exceeding Targets:\n');
    targetFailures.forEach((item) => {
      console.log(`   ${item.name}:`);
      console.log(`      Current: ${item.current.toFixed(2)}${item.unit}`);
      console.log(`      Target:  ${item.target}${item.unit}`);
      console.log('');
    });
  }

  // Summary
  console.log('════════════════════════════════════════════════════════════════');
  console.log('Summary:');
  console.log(`   Improvements: ${improvements.length}`);
  console.log(
    `   Regressions: ${regressions.length}${hasCriticalRegressions ? ' (including critical)' : ''}`
  );
  console.log(`   Stable: ${stable.length}`);
  console.log(`   Target Failures: ${targetFailures.length}`);
  console.log('════════════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  if (hasCriticalRegressions) {
    console.log('❌ CRITICAL: Performance regressions exceed acceptable targets!');
    console.log('   Action required: Investigate and fix before merging.');
    process.exit(1);
  } else if (hasRegressions) {
    console.log('⚠️  WARNING: Performance regressions detected within threshold.');
    console.log('   Review recommended, but not blocking.');
    process.exit(0); // Don't block, but show warning
  } else {
    console.log('✅ No performance regressions detected.');
    process.exit(0);
  }
}

// Run
main();
