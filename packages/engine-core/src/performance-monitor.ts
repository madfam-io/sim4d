/**
 * Performance Monitoring System
 * Tracks and reports performance metrics for BrepFlow operations
 */

export interface PerformanceMetrics {
  // Timing metrics
  evaluationTime: number;
  renderTime: number;
  workerTime: number;

  // Memory metrics
  heapUsed: number;
  heapTotal: number;
  wasmMemory: number;

  // Graph metrics
  nodeCount: number;
  edgeCount: number;
  dirtyNodes: number;
  cacheHits: number;
  cacheMisses: number;

  // Geometry metrics
  shapeCount: number;
  triangleCount: number;
  vertexCount: number;

  // Frame metrics
  fps: number;
  frameTime: number;
  drawCalls: number;
}

export interface PerformanceThresholds {
  maxEvaluationTime: number; // ms
  maxRenderTime: number; // ms
  maxMemoryUsage: number; // MB
  minFPS: number;
  maxTriangles: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = this.createEmptyMetrics();
  private history: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 100;

  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fpsUpdateInterval = 1000; // Update FPS every second
  private lastFPSUpdate = performance.now();

  private thresholds: PerformanceThresholds = {
    maxEvaluationTime: 1000, // 1 second
    maxRenderTime: 16, // 60 FPS target
    maxMemoryUsage: 2000, // 2GB
    minFPS: 30,
    maxTriangles: 5_000_000,
  };

  private listeners = new Set<(metrics: PerformanceMetrics) => void>();

  /**
   * Start a performance measurement
   */
  startMeasure(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMeasure(name, duration);
    };
  }

  /**
   * Record a performance measurement
   */
  recordMeasure(name: string, duration: number): void {
    switch (name) {
      case 'evaluation':
        this.metrics.evaluationTime = duration;
        break;
      case 'render':
        this.metrics.renderTime = duration;
        break;
      case 'worker':
        this.metrics.workerTime = duration;
        break;
    }
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as unknown).memory;
      this.metrics.heapUsed = memory.usedJSHeapSize / 1048576; // Convert to MB
      this.metrics.heapTotal = memory.totalJSHeapSize / 1048576;
    }
  }

  /**
   * Update graph metrics
   */
  updateGraphMetrics(stats: {
    nodeCount: number;
    edgeCount: number;
    dirtyNodes: number;
    cacheHits: number;
    cacheMisses: number;
  }): void {
    Object.assign(this.metrics, stats);
  }

  /**
   * Update geometry metrics
   */
  updateGeometryMetrics(stats: {
    shapeCount: number;
    triangleCount: number;
    vertexCount: number;
  }): void {
    Object.assign(this.metrics, stats);
  }

  /**
   * Update frame metrics
   */
  updateFrameMetrics(drawCalls: number): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.metrics.frameTime = deltaTime;
    this.metrics.drawCalls = drawCalls;

    this.frameCount++;

    // Update FPS periodically
    if (now - this.lastFPSUpdate >= this.fpsUpdateInterval) {
      this.metrics.fps = (this.frameCount * 1000) / (now - this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = now;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics history
   */
  getHistory(): PerformanceMetrics[] {
    return [...this.history];
  }

  /**
   * Get average metrics over time window
   */
  getAverageMetrics(windowSize = 10): PerformanceMetrics {
    const recent = this.history.slice(-windowSize);
    if (recent.length === 0) return this.createEmptyMetrics();

    const avg = this.createEmptyMetrics();
    const keys = Object.keys(avg) as (keyof PerformanceMetrics)[];

    for (const key of keys) {
      const values = recent.map((m) => m[key] as number);
      avg[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    return avg;
  }

  /**
   * Check if performance is within thresholds
   */
  checkThresholds(): {
    violations: string[];
    warnings: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    if (this.metrics.evaluationTime > this.thresholds.maxEvaluationTime) {
      violations.push(
        `Evaluation time (${this.metrics.evaluationTime.toFixed(0)}ms) exceeds limit`
      );
    }

    if (this.metrics.renderTime > this.thresholds.maxRenderTime) {
      warnings.push(`Render time (${this.metrics.renderTime.toFixed(1)}ms) may cause frame drops`);
    }

    if (this.metrics.heapUsed > this.thresholds.maxMemoryUsage) {
      violations.push(`Memory usage (${this.metrics.heapUsed.toFixed(0)}MB) exceeds limit`);
    }

    if (this.metrics.fps > 0 && this.metrics.fps < this.thresholds.minFPS) {
      warnings.push(`FPS (${this.metrics.fps.toFixed(0)}) below target`);
    }

    if (this.metrics.triangleCount > this.thresholds.maxTriangles) {
      warnings.push(`Triangle count (${this.metrics.triangleCount}) may impact performance`);
    }

    return { violations, warnings };
  }

  /**
   * Take a performance snapshot
   */
  snapshot(): void {
    this.updateMemoryMetrics();

    const snapshot = { ...this.metrics };
    this.history.push(snapshot);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Notify listeners
    this.notifyListeners(snapshot);
  }

  /**
   * Subscribe to performance updates
   */
  subscribe(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    Object.assign(this.thresholds, thresholds);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const current = this.getMetrics();
    const average = this.getAverageMetrics();
    const { violations, warnings } = this.checkThresholds();

    const report = [
      '=== Performance Report ===',
      '',
      'Current Metrics:',
      `  Evaluation: ${current.evaluationTime.toFixed(1)}ms`,
      `  Render: ${current.renderTime.toFixed(1)}ms`,
      `  FPS: ${current.fps.toFixed(0)}`,
      `  Memory: ${current.heapUsed.toFixed(0)}MB / ${current.heapTotal.toFixed(0)}MB`,
      `  Shapes: ${current.shapeCount}`,
      `  Triangles: ${current.triangleCount.toLocaleString()}`,
      `  Cache Hit Rate: ${this.getCacheHitRate().toFixed(1)}%`,
      '',
      'Average Metrics (last 10 samples):',
      `  Evaluation: ${average.evaluationTime.toFixed(1)}ms`,
      `  Render: ${average.renderTime.toFixed(1)}ms`,
      `  FPS: ${average.fps.toFixed(0)}`,
      '',
    ];

    if (violations.length > 0) {
      report.push('⚠️ Performance Violations:');
      violations.forEach((v) => report.push(`  - ${v}`));
      report.push('');
    }

    if (warnings.length > 0) {
      report.push('⚡ Performance Warnings:');
      warnings.forEach((w) => report.push(`  - ${w}`));
      report.push('');
    }

    return report.join('\\n');
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        current: this.metrics,
        history: this.history,
        thresholds: this.thresholds,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.createEmptyMetrics();
    this.history = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.lastFPSUpdate = performance.now();
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
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
    };
  }

  private getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total === 0 ? 0 : (this.metrics.cacheHits / total) * 100;
  }

  private notifyListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach((listener) => listener(metrics));
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for automatic timing
 */
export function measurePerformance(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const stop = performanceMonitor.startMeasure(propertyKey);
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } finally {
      stop();
    }
  };

  return descriptor;
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceMonitor.getMetrics());

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    return unsubscribe;
  }, []);

  return {
    metrics,
    reset: () => performanceMonitor.reset(),
    snapshot: () => performanceMonitor.snapshot(),
    report: () => performanceMonitor.generateReport(),
  };
}
