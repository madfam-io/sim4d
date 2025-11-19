/**
 * Performance Reporter
 * Exports and reports performance metrics for monitoring and analysis
 */

import type { PerformanceMetrics } from './performance-monitor';

export interface PerformanceReport {
  timestamp: number;
  duration: number; // Report duration in ms
  metrics: PerformanceMetrics;
  aggregates: PerformanceAggregates;
  thresholdViolations: ThresholdViolation[];
}

export interface PerformanceAggregates {
  avgEvaluationTime: number;
  maxEvaluationTime: number;
  avgRenderTime: number;
  maxRenderTime: number;
  avgFPS: number;
  minFPS: number;
  totalCacheHits: number;
  totalCacheMisses: number;
  cacheHitRate: number;
}

export interface ThresholdViolation {
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  severity: 'warning' | 'error' | 'critical';
}

export interface PerformanceExporter {
  export(report: PerformanceReport): Promise<void>;
}

export class ConsolePerformanceExporter implements PerformanceExporter {
  async export(report: PerformanceReport): Promise<void> {
    console.group(`[Performance Report] ${new Date(report.timestamp).toISOString()}`);
    console.log('Duration:', `${report.duration}ms`);
    console.log('Metrics:', report.metrics);
    console.log('Aggregates:', report.aggregates);

    if (report.thresholdViolations.length > 0) {
      console.warn('Threshold Violations:', report.thresholdViolations);
    }

    console.groupEnd();
  }
}

export class JSONPerformanceExporter implements PerformanceExporter {
  constructor(private endpoint?: string) {}

  async export(report: PerformanceReport): Promise<void> {
    if (this.endpoint) {
      try {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      } catch (error) {
        console.error('Failed to export performance metrics:', error);
      }
    }
  }
}

export class PerformanceReporter {
  private metricsHistory: PerformanceMetrics[] = [];
  private violations: ThresholdViolation[] = [];
  private exporters: PerformanceExporter[] = [];
  private reportInterval: ReturnType<typeof setInterval> | null = null;
  private startTime = Date.now();

  constructor(
    private readonly intervalMs: number = 60000, // Default: 1 minute
    exporters: PerformanceExporter[] = [new ConsolePerformanceExporter()]
  ) {
    this.exporters = exporters;
  }

  addExporter(exporter: PerformanceExporter): void {
    this.exporters.push(exporter);
  }

  recordMetrics(metrics: PerformanceMetrics): void {
    this.metricsHistory.push(metrics);

    // Check thresholds
    this.checkThresholds(metrics);

    // Limit history size
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }
  }

  recordViolation(violation: ThresholdViolation): void {
    this.violations.push(violation);

    // Limit violations history
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const now = Date.now();

    // Check evaluation time (warning at 500ms, error at 1s, critical at 2s)
    if (metrics.evaluationTime > 2000) {
      this.recordViolation({
        metric: 'evaluationTime',
        value: metrics.evaluationTime,
        threshold: 2000,
        timestamp: now,
        severity: 'critical',
      });
    } else if (metrics.evaluationTime > 1000) {
      this.recordViolation({
        metric: 'evaluationTime',
        value: metrics.evaluationTime,
        threshold: 1000,
        timestamp: now,
        severity: 'error',
      });
    } else if (metrics.evaluationTime > 500) {
      this.recordViolation({
        metric: 'evaluationTime',
        value: metrics.evaluationTime,
        threshold: 500,
        timestamp: now,
        severity: 'warning',
      });
    }

    // Check FPS (warning below 30, error below 20, critical below 10)
    if (metrics.fps < 10 && metrics.fps > 0) {
      this.recordViolation({
        metric: 'fps',
        value: metrics.fps,
        threshold: 10,
        timestamp: now,
        severity: 'critical',
      });
    } else if (metrics.fps < 20 && metrics.fps > 0) {
      this.recordViolation({
        metric: 'fps',
        value: metrics.fps,
        threshold: 20,
        timestamp: now,
        severity: 'error',
      });
    } else if (metrics.fps < 30 && metrics.fps > 0) {
      this.recordViolation({
        metric: 'fps',
        value: metrics.fps,
        threshold: 30,
        timestamp: now,
        severity: 'warning',
      });
    }

    // Check memory (warning at 1.5GB, error at 1.8GB, critical at 2GB)
    const heapMB = metrics.heapUsed / (1024 * 1024);
    if (heapMB > 2000) {
      this.recordViolation({
        metric: 'heapUsed',
        value: heapMB,
        threshold: 2000,
        timestamp: now,
        severity: 'critical',
      });
    } else if (heapMB > 1800) {
      this.recordViolation({
        metric: 'heapUsed',
        value: heapMB,
        threshold: 1800,
        timestamp: now,
        severity: 'error',
      });
    } else if (heapMB > 1500) {
      this.recordViolation({
        metric: 'heapUsed',
        value: heapMB,
        threshold: 1500,
        timestamp: now,
        severity: 'warning',
      });
    }
  }

  private computeAggregates(): PerformanceAggregates {
    if (this.metricsHistory.length === 0) {
      return {
        avgEvaluationTime: 0,
        maxEvaluationTime: 0,
        avgRenderTime: 0,
        maxRenderTime: 0,
        avgFPS: 0,
        minFPS: 0,
        totalCacheHits: 0,
        totalCacheMisses: 0,
        cacheHitRate: 0,
      };
    }

    const evaluationTimes = this.metricsHistory.map((m) => m.evaluationTime);
    const renderTimes = this.metricsHistory.map((m) => m.renderTime);
    const fps = this.metricsHistory.map((m) => m.fps).filter((f) => f > 0);

    const totalCacheHits = this.metricsHistory.reduce((sum, m) => sum + m.cacheHits, 0);
    const totalCacheMisses = this.metricsHistory.reduce((sum, m) => sum + m.cacheMisses, 0);
    const cacheHitRate =
      totalCacheHits + totalCacheMisses > 0
        ? totalCacheHits / (totalCacheHits + totalCacheMisses)
        : 0;

    return {
      avgEvaluationTime:
        evaluationTimes.reduce((sum, t) => sum + t, 0) / evaluationTimes.length,
      maxEvaluationTime: Math.max(...evaluationTimes),
      avgRenderTime: renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length,
      maxRenderTime: Math.max(...renderTimes),
      avgFPS: fps.length > 0 ? fps.reduce((sum, f) => sum + f, 0) / fps.length : 0,
      minFPS: fps.length > 0 ? Math.min(...fps) : 0,
      totalCacheHits,
      totalCacheMisses,
      cacheHitRate,
    };
  }

  generateReport(): PerformanceReport {
    const now = Date.now();
    const latestMetrics =
      this.metricsHistory.length > 0
        ? this.metricsHistory[this.metricsHistory.length - 1]
        : ({
            evaluationTime: 0,
            renderTime: 0,
            workerTime: 0,
            heapUsed: 0,
            heapTotal: 0,
            wasmMemory: 0,
            nodeCount: 0,
            edgeCount: 0,
            dirtyNodes: 0,
            cacheHits: 0,
            cacheMisses: 0,
            shapeCount: 0,
            triangleCount: 0,
            vertexCount: 0,
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
          } as PerformanceMetrics);

    return {
      timestamp: now,
      duration: now - this.startTime,
      metrics: latestMetrics,
      aggregates: this.computeAggregates(),
      thresholdViolations: [...this.violations],
    };
  }

  async exportReport(): Promise<void> {
    const report = this.generateReport();

    await Promise.all(
      this.exporters.map((exporter) =>
        exporter.export(report).catch((error) => {
          console.error('Exporter failed:', error);
        })
      )
    );

    // Clear violations after export
    this.violations = [];
  }

  startAutoExport(): void {
    if (this.reportInterval) {
      return;
    }

    this.reportInterval = setInterval(() => {
      this.exportReport().catch((error) => {
        console.error('Failed to export performance report:', error);
      });
    }, this.intervalMs);
  }

  stopAutoExport(): void {
    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
  }

  reset(): void {
    this.metricsHistory = [];
    this.violations = [];
    this.startTime = Date.now();
  }
}
