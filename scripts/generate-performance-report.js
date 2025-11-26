#!/usr/bin/env node
/**
 * Performance Report Generator
 * Creates HTML report with charts showing performance trends over time
 */

const fs = require('fs');
const path = require('path');

// Load all metrics
function loadAllMetrics() {
  const metricsDir = path.join(__dirname, '../performance-metrics');
  const allMetrics = {};

  if (!fs.existsSync(metricsDir)) {
    console.error('No metrics directory found');
    return allMetrics;
  }

  for (const file of fs.readdirSync(metricsDir)) {
    if (!file.endsWith('.json') || file === 'baselines.json') continue;

    const metricName = file.replace('.json', '');
    const filePath = path.join(metricsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    allMetrics[metricName] = data;
  }

  return allMetrics;
}

// Load baselines
function loadBaselines() {
  const baselinesPath = path.join(__dirname, '../performance-metrics/baselines.json');

  if (!fs.existsSync(baselinesPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));
}

// Generate HTML report
function generateHTMLReport(metrics, baselines) {
  const reportDir = path.join(__dirname, '../performance-reports');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sim4D Performance Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #60a5fa;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .stat-label {
      color: #94a3b8;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #60a5fa;
    }

    .stat-unit {
      font-size: 1rem;
      color: #94a3b8;
      margin-left: 0.25rem;
    }

    .stat-trend {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .trend-up {
      color: #22c55e;
    }

    .trend-down {
      color: #ef4444;
    }

    .trend-stable {
      color: #94a3b8;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .chart-container {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .chart-title {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #e2e8f0;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #334155;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Sim4D Performance Report</h1>
      <p class="subtitle">Performance metrics and trends over time</p>
      <p class="subtitle">Generated: ${new Date().toLocaleString()}</p>
    </header>

    <div class="stats-grid">
      ${generateStatCards(metrics, baselines)}
    </div>

    <div class="charts-grid">
      ${generateChartContainers(metrics)}
    </div>

    <footer>
      <p>Sim4D Performance Monitoring System</p>
      <p>Tracking ${Object.keys(metrics).length} performance metrics</p>
    </footer>
  </div>

  <script>
    ${generateChartScripts(metrics, baselines)}
  </script>
</body>
</html>
  `;

  const reportPath = path.join(reportDir, 'index.html');
  fs.writeFileSync(reportPath, html);

  console.log(`✅ Performance report generated: ${reportPath}`);
  return reportPath;
}

// Generate stat cards HTML
function generateStatCards(metrics, baselines) {
  const cards = [];

  const keyMetrics = [
    {
      name: 'app_cold_load_ms',
      label: 'App Cold Load',
      unit: 'ms',
      target: 3000,
      lowerIsBetter: true,
    },
    {
      name: 'viewport_fps_2m',
      label: 'Viewport FPS (2M)',
      unit: 'FPS',
      target: 60,
      lowerIsBetter: false,
    },
    {
      name: 'occt_boolean_union_ms',
      label: 'Boolean Union',
      unit: 'ms',
      target: 1000,
      lowerIsBetter: true,
    },
    {
      name: 'viewport_memory_mb',
      label: 'Memory Usage',
      unit: 'MB',
      target: 1500,
      lowerIsBetter: true,
    },
  ];

  keyMetrics.forEach((metric) => {
    const data = metrics[metric.name];
    if (!data || data.length === 0) return;

    const current = data[data.length - 1].value;
    const baseline = baselines[metric.name];

    let trendHTML = '';
    if (baseline) {
      const change = ((current - baseline) / baseline) * 100;
      const isImprovement = metric.lowerIsBetter ? change < 0 : change > 0;
      const trendClass = isImprovement
        ? 'trend-up'
        : Math.abs(change) < 5
          ? 'trend-stable'
          : 'trend-down';
      const arrow = isImprovement ? '↓' : Math.abs(change) < 5 ? '→' : '↑';

      trendHTML = `<div class="stat-trend ${trendClass}">${arrow} ${Math.abs(change).toFixed(1)}% vs baseline</div>`;
    }

    cards.push(`
      <div class="stat-card">
        <div class="stat-label">${metric.label}</div>
        <div class="stat-value">
          ${current.toFixed(1)}
          <span class="stat-unit">${metric.unit}</span>
        </div>
        <div class="stat-trend trend-stable">Target: ${metric.target}${metric.unit}</div>
        ${trendHTML}
      </div>
    `);
  });

  return cards.join('');
}

// Generate chart container HTML
function generateChartContainers(metrics) {
  const containers = [];

  const chartMetrics = [
    { name: 'app_cold_load_ms', title: 'App Load Time (ms)' },
    { name: 'viewport_fps_100k', title: 'Viewport FPS (100K triangles)' },
    { name: 'occt_boolean_union_ms', title: 'Boolean Union Time (ms)' },
    { name: 'viewport_memory_mb', title: 'Memory Usage (MB)' },
  ];

  chartMetrics.forEach((metric) => {
    if (!metrics[metric.name] || metrics[metric.name].length === 0) return;

    containers.push(`
      <div class="chart-container">
        <h3 class="chart-title">${metric.title}</h3>
        <div class="chart-wrapper">
          <canvas id="chart-${metric.name}"></canvas>
        </div>
      </div>
    `);
  });

  return containers.join('');
}

// Generate Chart.js scripts
function generateChartScripts(metrics, baselines) {
  const scripts = [];

  const chartMetrics = [
    { name: 'app_cold_load_ms', title: 'App Load Time', color: '96, 165, 250', target: 3000 },
    { name: 'viewport_fps_100k', title: 'Viewport FPS', color: '34, 197, 94', target: 60 },
    { name: 'occt_boolean_union_ms', title: 'Boolean Union', color: '168, 85, 247', target: 1000 },
    { name: 'viewport_memory_mb', title: 'Memory Usage', color: '249, 115, 22', target: 1500 },
  ];

  chartMetrics.forEach((metric) => {
    const data = metrics[metric.name];
    if (!data || data.length === 0) return;

    const labels = data.map((d) => new Date(d.timestamp).toLocaleDateString());
    const values = data.map((d) => d.value);
    const baseline = baselines[metric.name];

    scripts.push(`
      new Chart(document.getElementById('chart-${metric.name}'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(labels)},
          datasets: [
            {
              label: '${metric.title}',
              data: ${JSON.stringify(values)},
              borderColor: 'rgba(${metric.color}, 1)',
              backgroundColor: 'rgba(${metric.color}, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            ${
              baseline
                ? `{
              label: 'Baseline',
              data: Array(${values.length}).fill(${baseline}),
              borderColor: 'rgba(148, 163, 184, 0.5)',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },`
                : ''
            }
            {
              label: 'Target',
              data: Array(${values.length}).fill(${metric.target}),
              borderColor: 'rgba(239, 68, 68, 0.5)',
              borderWidth: 2,
              borderDash: [10, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: '#e2e8f0'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: '#334155'
              }
            },
            y: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                color: '#334155'
              }
            }
          }
        }
      });
    `);
  });

  return scripts.join('\n');
}

// Main execution
function main() {
  console.log('Generating performance report...');

  const metrics = loadAllMetrics();
  const baselines = loadBaselines();

  if (Object.keys(metrics).length === 0) {
    console.error('No metrics found. Run performance tests first.');
    process.exit(1);
  }

  generateHTMLReport(metrics, baselines);

  console.log('✅ Report generation complete');
}

main();
