/**
 * Performance metrics collection and monitoring
 */

import { PerformanceMetric, SystemHealth, UserEvent } from '../error-handling/types';
import { Logger } from '../logging/logger';

export class MetricsCollector {
  private static instance: MetricsCollector | null = null;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private logger: Logger;
  private collectInterval: number | null = null;
  private metricsBuffer: PerformanceMetric[] = [];
  private readonly BUFFER_FLUSH_INTERVAL = 30000; // 30 seconds
  private readonly MAX_BUFFER_SIZE = 1000;

  private constructor() {
    this.logger = Logger.getInstance();
    this.startCollection();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Start metrics collection
   */
  private startCollection(): void {
    // Collect system metrics periodically
    this.collectInterval = window.setInterval(() => {
      this.collectSystemMetrics();
      this.flushBuffer();
    }, this.BUFFER_FLUSH_INTERVAL);

    // Collect navigation timing
    this.collectNavigationMetrics();

    // Setup performance observers
    this.setupPerformanceObservers();
  }

  /**
   * Stop metrics collection
   */
  public stop(): void {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.collectInterval = null;
    }
  }

  /**
   * Record a counter metric
   */
  public incrementCounter(
    name: string,
    labels: Record<string, string> = {},
    value: number = 1
  ): void {
    const key = this.createMetricKey(name, labels);
    const currentValue = this.counters.get(key) || 0;
    this.counters.set(key, currentValue + value);

    this.addMetric({
      name,
      value: currentValue + value,
      unit: 'count',
      timestamp: Date.now(),
      labels,
    });
  }

  /**
   * Record a gauge metric (current value)
   */
  public setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    this.gauges.set(key, value);

    this.addMetric({
      name,
      value,
      unit: 'gauge',
      timestamp: Date.now(),
      labels,
    });
  }

  /**
   * Record a histogram metric (distribution of values)
   */
  public recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    // Keep only recent values (last 1000)
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }

    this.addMetric({
      name,
      value,
      unit: 'histogram',
      timestamp: Date.now(),
      labels,
    });
  }

  /**
   * Record timing metric
   */
  public recordTiming(name: string, duration: number, labels: Record<string, string> = {}): void {
    this.recordHistogram(name, duration, { ...labels, unit: 'ms' });
  }

  /**
   * Start timing operation
   */
  public startTiming(name: string): (labels?: Record<string, string>) => void {
    const startTime = performance.now();

    return (labels: Record<string, string> = {}) => {
      const duration = performance.now() - startTime;
      this.recordTiming(name, duration, labels);
    };
  }

  /**
   * Record user event
   */
  public recordUserEvent(event: Omit<UserEvent, 'timestamp'>): void {
    const fullEvent: UserEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.logger.info('User event', fullEvent);

    // Track user interaction metrics
    this.incrementCounter('user_events_total', {
      type: event.type,
      target: event.target || 'unknown',
    });
  }

  /**
   * Get system health metrics
   */
  public getSystemHealth(): SystemHealth {
    const memoryInfo = (performance as any).memory;
    const errorRate = this.calculateErrorRate();
    const avgResponseTime = this.calculateAverageResponseTime();

    return {
      memoryUsage: memoryInfo?.usedJSHeapSize || 0,
      wasmMemoryUsage: this.getWasmMemoryUsage(),
      activeWorkers: this.getActiveWorkerCount(),
      errorRate,
      averageResponseTime: avgResponseTime,
      lastHealthCheck: Date.now(),
    };
  }

  /**
   * Get metrics by name
   */
  public getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): Map<string, PerformanceMetric[]> {
    return new Map(this.metrics);
  }

  /**
   * Get counter value
   */
  public getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = this.createMetricKey(name, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get gauge value
   */
  public getGauge(name: string, labels: Record<string, string> = {}): number {
    const key = this.createMetricKey(name, labels);
    return this.gauges.get(key) || 0;
  }

  /**
   * Get histogram statistics
   */
  public getHistogramStats(
    name: string,
    labels: Record<string, string> = {}
  ): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } {
    const key = this.createMetricKey(name, labels);
    const values = this.histograms.get(key) || [];

    if (values.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      sum,
      avg: values.length > 0 ? sum / values.length : 0,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
    };
  }

  /**
   * Export metrics for external monitoring services
   */
  public exportMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, ReturnType<MetricsCollector['getHistogramStats']>>;
    systemHealth: SystemHealth;
  } {
    const histogramStats: Record<string, ReturnType<MetricsCollector['getHistogramStats']>> = {};

    for (const [key] of this.histograms) {
      const { name, labels } = this.parseMetricKey(key);
      histogramStats[key] = this.getHistogramStats(name, labels);
    }

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: histogramStats,
      systemHealth: this.getSystemHealth(),
    };
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metricsBuffer.push(metric);

    // Flush buffer if it gets too large
    if (this.metricsBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }
  }

  /**
   * Flush metrics buffer
   */
  private flushBuffer(): void {
    if (this.metricsBuffer.length === 0) return;

    // Group metrics by name
    for (const metric of this.metricsBuffer) {
      const existing = this.metrics.get(metric.name) || [];
      existing.push(metric);

      // Keep only recent metrics (last 1000 per metric type)
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000);
      }

      this.metrics.set(metric.name, existing);
    }

    this.metricsBuffer = [];
  }

  /**
   * Collect system performance metrics
   */
  private collectSystemMetrics(): void {
    // Memory metrics
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      this.setGauge('memory_used_bytes', memoryInfo.usedJSHeapSize);
      this.setGauge('memory_total_bytes', memoryInfo.totalJSHeapSize);
      this.setGauge('memory_limit_bytes', memoryInfo.jsHeapSizeLimit);
    }

    // Connection metrics
    const connection = (navigator as any).connection;
    if (connection) {
      this.setGauge('network_downlink_mbps', connection.downlink);
      this.setGauge('network_rtt_ms', connection.rtt);
    }

    // CPU usage approximation (based on timing precision)
    const cpuStart = performance.now();
    setTimeout(() => {
      const cpuEnd = performance.now();
      const cpuTime = cpuEnd - cpuStart;
      this.recordTiming('cpu_scheduling_delay_ms', cpuTime - 1);
    }, 1);
  }

  /**
   * Collect navigation timing metrics
   */
  private collectNavigationMetrics(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        const startTime = (navigation as any).navigationStart || navigation.fetchStart || 0;
        this.recordTiming('page_load_time_ms', navigation.loadEventEnd - startTime);
        this.recordTiming('dom_content_loaded_ms', navigation.domContentLoadedEventEnd - startTime);
        this.recordTiming('first_paint_ms', navigation.responseEnd - startTime);
      }
    }
  }

  /**
   * Setup performance observers for detailed metrics
   */
  private setupPerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Measure resource loading times
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordTiming('resource_load_time_ms', entry.duration, {
              resource_type: resourceEntry.initiatorType,
              resource_name: entry.name.split('/').pop() || 'unknown',
            });
          }
        }
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        this.logger.warn('Failed to setup resource observer', { error: e });
      }

      // Measure long tasks (performance issues)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordTiming('long_task_duration_ms', entry.duration);
          this.incrementCounter('long_tasks_total');
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        this.logger.warn('Failed to setup long task observer', { error: e });
      }
    }
  }

  /**
   * Create unique key for metric with labels
   */
  private createMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return labelStr ? `${name}{${labelStr}}` : name;
  }

  /**
   * Parse metric key back to name and labels
   */
  private parseMetricKey(key: string): { name: string; labels: Record<string, string> } {
    const match = key.match(/^([^{]+)(?:\{(.+)\})?$/);
    if (!match) return { name: key, labels: {} };

    const [, name, labelStr] = match;
    const labels: Record<string, string> = {};

    if (labelStr) {
      const labelPairs = labelStr.split(',');
      for (const pair of labelPairs) {
        const [k, v] = pair.split('=');
        if (k && v) {
          labels[k] = v.replace(/"/g, '');
        }
      }
    }

    return { name: name ?? key, labels };
  }

  /**
   * Calculate error rate over the last 5 minutes
   */
  private calculateErrorRate(): number {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const totalErrors = this.getCounter('errors_total');
    const totalRequests = this.getCounter('requests_total');

    if (totalRequests === 0) return 0;
    return (totalErrors / totalRequests) * 100;
  }

  /**
   * Calculate average response time over recent requests
   */
  private calculateAverageResponseTime(): number {
    const responseStats = this.getHistogramStats('response_time_ms');
    return responseStats.avg;
  }

  /**
   * Get WASM memory usage if available
   */
  private getWasmMemoryUsage(): number | undefined {
    // This would need to be implemented based on specific WASM module
    // For now, return undefined
    return undefined;
  }

  /**
   * Get count of active web workers
   */
  private getActiveWorkerCount(): number {
    // This would need to be tracked by the application
    // For now, return 0
    return 0;
  }

  /**
   * Record a counter value directly
   */
  public recordCounter(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    this.counters.set(key, value);
  }

  /**
   * Record a gauge value directly
   */
  public recordGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    this.gauges.set(key, value);
  }

  /**
   * Record a performance metric directly
   */
  public recordMetric(metric: PerformanceMetric): void {
    this.addMetric(metric);
  }

  /**
   * Remove a counter
   */
  public removeCounter(name: string, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    this.counters.delete(key);
  }

  /**
   * Remove a gauge
   */
  public removeGauge(name: string, labels: Record<string, string> = {}): void {
    const key = this.createMetricKey(name, labels);
    this.gauges.delete(key);
  }
}
