/**
 * Evaluation Profiler
 * Captures per-node evaluation timings and failure diagnostics so callers can
 * monitor performance targets (P95 ≤ 1.5s) and surface actionable errors.
 */

export interface EvaluationSample {
  nodeId: string;
  nodeType: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  operation?: string;
  cacheHit?: boolean;
  timestamp: number;
}

export interface EvaluationSummary {
  sampleCount: number;
  successCount: number;
  failureCount: number;
  averageMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  slowNodes: Array<Pick<EvaluationSample, 'nodeId' | 'nodeType' | 'durationMs' | 'operation'>>;
  categoryBreakdown: Record<
    string,
    {
      count: number;
      averageMs: number;
    }
  >;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Lightweight in-memory profiler with bounded sample history.
 */
export class EvaluationProfiler {
  private samples: EvaluationSample[] = [];

  constructor(private readonly maxSamples = 512) {}

  record(sample: EvaluationSample): void {
    this.samples.push(sample);
    if (this.samples.length > this.maxSamples) {
      this.samples.splice(0, this.samples.length - this.maxSamples);
    }
  }

  clear(): void {
    this.samples = [];
  }

  getSummary(): EvaluationSummary {
    const successSamples = this.samples.filter((sample) => sample.success);
    const successDurations = successSamples.map((sample) => sample.durationMs);
    const failureCount = this.samples.length - successSamples.length;

    const averageMs =
      successDurations.length === 0
        ? 0
        : successDurations.reduce((acc, value) => acc + value, 0) / successDurations.length;

    const slowNodes = successSamples
      .filter((sample) => sample.durationMs >= 1500)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 5)
      .map((sample) => ({
        nodeId: sample.nodeId,
        nodeType: sample.nodeType,
        durationMs: sample.durationMs,
        operation: sample.operation,
      }));

    const categoryBreakdown: EvaluationSummary['categoryBreakdown'] = {};
    for (const sample of successSamples) {
      const category = sample.nodeType.includes('::') ? sample.nodeType.split('::')[0] : 'Unknown';

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, averageMs: 0 };
      }

      const entry = categoryBreakdown[category];
      entry.count += 1;
      entry.averageMs += sample.durationMs;
    }

    for (const entry of Object.values(categoryBreakdown)) {
      entry.averageMs = entry.count === 0 ? 0 : entry.averageMs / entry.count;
    }

    return {
      sampleCount: this.samples.length,
      successCount: successSamples.length,
      failureCount,
      averageMs,
      p50Ms: percentile(successDurations, 50),
      p95Ms: percentile(successDurations, 95),
      maxMs: successDurations.length === 0 ? 0 : Math.max(...successDurations),
      slowNodes,
      categoryBreakdown,
    };
  }

  getRecentFailures(limit = 10): EvaluationSample[] {
    return this.samples.filter((sample) => !sample.success).slice(-limit);
  }
}
