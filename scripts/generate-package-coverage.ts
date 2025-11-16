#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import {
  createCoverageMap,
  createCoverageSummary,
  type CoverageSummary,
} from 'istanbul-lib-coverage';

const REPO_ROOT = path.resolve(__dirname, '..');
const COVERAGE_ROOT = path.join(REPO_ROOT, 'coverage');
const COVERAGE_FINAL_PATH = path.join(COVERAGE_ROOT, 'coverage-final.json');
const OUTPUT_DIR = path.join(COVERAGE_ROOT, 'packages');
const JSON_OUTPUT = path.join(OUTPUT_DIR, 'coverage-summary.json');
const MARKDOWN_OUTPUT = path.join(OUTPUT_DIR, 'coverage-summary.md');
const ARTIFACTS_DIR = path.join(REPO_ROOT, 'artifacts', 'coverage');
const ARTIFACTS_JSON_OUTPUT = path.join(ARTIFACTS_DIR, 'per-package-coverage.json');
const DOCS_DIR = path.join(REPO_ROOT, 'docs', 'testing');
const DOCS_JSON_OUTPUT = path.join(DOCS_DIR, 'per-package-coverage.json');
const DOCS_MARKDOWN_OUTPUT = path.join(DOCS_DIR, 'PER_PACKAGE_COVERAGE.md');

const COVERAGE_THRESHOLD = 80;
const METRIC_KEYS = ['statements', 'branches', 'functions', 'lines'] as const;
const PUBLISH_FLAG = '--publish';

type MetricKey = (typeof METRIC_KEYS)[number];
type CoverageSummaryJSON = ReturnType<CoverageSummary['toJSON']>;

interface PackageCoverageRow {
  packageName: PackageKey;
  summary: CoverageSummaryJSON;
  lowestMetric: number;
  meetsThreshold: boolean;
}

function ensureCoverageFile(): Record<string, unknown> | null {
  if (!fs.existsSync(COVERAGE_FINAL_PATH)) {
    console.warn('[coverage] coverage-final.json not found, skipping per-package summary');
    return null;
  }

  const raw = fs.readFileSync(COVERAGE_FINAL_PATH, 'utf-8');
  return JSON.parse(raw) as Record<string, unknown>;
}

type PackageKey = `packages/${string}` | `apps/${string}`;

function determineKey(filePath: string): PackageKey | null {
  const relative = path.relative(REPO_ROOT, filePath);
  const [first, second] = relative.split(path.sep);

  if (!second) return null;

  if (first === 'packages') {
    return `packages/${second}`;
  }

  if (first === 'apps') {
    return `apps/${second}`;
  }

  return null;
}

function mergeSummaries(target: CoverageSummary, source: CoverageSummary): CoverageSummary {
  target.merge(source);
  return target;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizePct(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function formatPercent(value: number): string {
  return `${sanitizePct(value).toFixed(2)}%`;
}

function buildCoverageRows(summaryMap: Map<PackageKey, CoverageSummary>): PackageCoverageRow[] {
  const sortedEntries = Array.from(summaryMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  return sortedEntries.map(([pkg, summary]) => {
    const data = summary.toJSON();
    const metricValues = METRIC_KEYS.map((metric) => sanitizePct(data[metric]?.pct));
    const lowestMetric = Math.min(...metricValues);
    const meetsThreshold = metricValues.every((pct) => pct >= COVERAGE_THRESHOLD);

    return {
      packageName: pkg,
      summary: data,
      lowestMetric,
      meetsThreshold,
    } satisfies PackageCoverageRow;
  });
}

function buildSerializableSummary(rows: PackageCoverageRow[], generatedAt: string) {
  return {
    metadata: {
      generatedAt,
      threshold: COVERAGE_THRESHOLD,
      packageCount: rows.length,
    },
    packages: rows.reduce<Record<string, unknown>>((acc, row) => {
      acc[row.packageName] = {
        ...row.summary,
        lowestMetric: row.lowestMetric,
        meetsThreshold: row.meetsThreshold,
      };
      return acc;
    }, {}),
  };
}

function formatStatus(row: PackageCoverageRow): string {
  return row.meetsThreshold ? '✅ ≥ 80%' : `⚠️ ${formatPercent(row.lowestMetric)}`;
}

function buildTableRows(rows: PackageCoverageRow[]): string[] {
  return rows.map((row) => {
    const data = row.summary;
    return `| ${row.packageName} | ${formatPercent(data.statements.pct)} | ${formatPercent(data.branches.pct)} | ${formatPercent(data.functions.pct)} | ${formatPercent(data.lines.pct)} | ${formatStatus(row)} |`;
  });
}

function writeCoverageOutputs(rows: PackageCoverageRow[], generatedAt: string): void {
  ensureDir(OUTPUT_DIR);

  const serialized = buildSerializableSummary(rows, generatedAt);

  const markdownLines: string[] = [
    '# Per-package Coverage Summary',
    '',
    `Generated: ${generatedAt}`,
    `Threshold: ${COVERAGE_THRESHOLD}%`,
    '',
    '| Package | Statements | Branches | Functions | Lines | Status |',
    '|---------|------------|----------|-----------|-------|--------|',
    ...buildTableRows(rows),
  ];

  fs.writeFileSync(JSON_OUTPUT, `${JSON.stringify(serialized, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(MARKDOWN_OUTPUT, `${markdownLines.join('\n')}\n`, 'utf-8');

  console.log(`[coverage] Wrote per-package coverage summary to ${JSON_OUTPUT}`);
}

function writePublicationOutputs(rows: PackageCoverageRow[], generatedAt: string): void {
  ensureDir(ARTIFACTS_DIR);
  ensureDir(DOCS_DIR);

  const serialized = buildSerializableSummary(rows, generatedAt);

  const markdownLines: string[] = [
    '# Per-package Coverage',
    '',
    '<!-- Generated by scripts/generate-package-coverage.ts -->',
    '',
    `- Generated: ${generatedAt}`,
    `- Threshold: ${COVERAGE_THRESHOLD}%`,
    '',
    '| Package | Statements | Branches | Functions | Lines | Status |',
    '|---------|------------|----------|-----------|-------|--------|',
    ...buildTableRows(rows),
  ];

  const failingPackages = rows.filter((row) => !row.meetsThreshold);

  if (failingPackages.length > 0) {
    markdownLines.push('', '## Packages Below Threshold');
    for (const row of failingPackages) {
      markdownLines.push(`- ${row.packageName} — lowest metric ${formatPercent(row.lowestMetric)}`);
    }
  }

  fs.writeFileSync(ARTIFACTS_JSON_OUTPUT, `${JSON.stringify(serialized, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(DOCS_JSON_OUTPUT, `${JSON.stringify(serialized, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(DOCS_MARKDOWN_OUTPUT, `${markdownLines.join('\n')}\n`, 'utf-8');

  console.log(`[coverage] Published per-package coverage artifacts to ${DOCS_MARKDOWN_OUTPUT}`);
}

function main(): void {
  const coverageJSON = ensureCoverageFile();
  if (!coverageJSON) return;

  const coverageMap = createCoverageMap(coverageJSON);
  const packageSummaries = new Map<PackageKey, CoverageSummary>();

  for (const filePath of coverageMap.files()) {
    const pkgKey = determineKey(filePath);
    if (!pkgKey) continue;

    const fileSummary = coverageMap.fileCoverageFor(filePath).toSummary();
    const existing = packageSummaries.get(pkgKey) ?? createCoverageSummary();
    packageSummaries.set(pkgKey, mergeSummaries(existing, fileSummary));
  }

  if (packageSummaries.size === 0) {
    console.warn('[coverage] No package/app files detected in coverage-final.json');
    return;
  }

  const generatedAt = new Date().toISOString();
  const rows = buildCoverageRows(packageSummaries);

  writeCoverageOutputs(rows, generatedAt);

  const shouldPublish = process.argv.slice(2).includes(PUBLISH_FLAG);
  if (shouldPublish) {
    writePublicationOutputs(rows, generatedAt);
  }
}

main();
