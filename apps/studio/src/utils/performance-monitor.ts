/**
 * Performance Monitoring System for BrepFlow Studio
 * Tracks FPS, memory usage, render times, and component performance
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  renderMetrics: {
    nodeCount: number;
    triangleCount: number;
    drawCalls: number;
    renderTime: number;
  };
  componentMetrics: {
    panelCount: number;
    inputCount: number;
    updateTime: number;
  };
}

export interface PerformanceThresholds {
  minFPS: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxNodeCount: number;
  maxTriangleCount: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private rafId: number | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      minFPS: 30,
      maxFrameTime: 33.33, // 30 FPS threshold
      maxMemoryUsage: 0.85, // 85% memory usage
      maxRenderTime: 16.67, // 60 FPS target
      maxNodeCount: 500,
      maxTriangleCount: 2000000,
      ...thresholds,
    };

    this.metrics = this.getInitialMetrics();
    this.setupPerformanceObserver();
  }

  private getInitialMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67,
      memory: {
        used: 0,
        limit: 0,
        percentage: 0,
      },
      renderMetrics: {
        nodeCount: 0,
        triangleCount: 0,
        drawCalls: 0,
        renderTime: 0,
      },
      componentMetrics: {
        panelCount: 0,
        inputCount: 0,
        updateTime: 0,
      },
    };
  }

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.handlePerformanceMeasure(entry as PerformanceMeasure);
            }
          }
        });

        this.performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('PerformanceObserver not available:', error);
      }
    }
  }

  private handlePerformanceMeasure(entry: PerformanceMeasure): void {
    switch (entry.name) {
      case 'viewport-render':
        this.metrics.renderMetrics.renderTime = entry.duration;
        break;
      case 'component-update':
        this.metrics.componentMetrics.updateTime = entry.duration;
        break;
    }
  }

  public start(): void {
    if (this.rafId) return;

    const measureFrame = (currentTime: number) => {
      if (this.lastFrameTime > 0) {
        const frameTime = currentTime - this.lastFrameTime;
        const fps = 1000 / frameTime;

        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }

        this.metrics.fps = Math.round(
          this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
        );
        this.metrics.frameTime = frameTime;
      }

      this.lastFrameTime = currentTime;
      this.frameCount++;

      // Update memory metrics
      this.updateMemoryMetrics();

      // Update component metrics
      this.updateComponentMetrics();

      // Notify observers
      this.notifyObservers();

      // Check performance thresholds
      this.checkThresholds();

      this.rafId = requestAnimationFrame(measureFrame);
    };

    this.rafId = requestAnimationFrame(measureFrame);
  }

  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
  }

  private updateComponentMetrics(): void {
    // Count active components
    this.metrics.componentMetrics.panelCount = document.querySelectorAll('.panel').length;
    this.metrics.componentMetrics.inputCount = document.querySelectorAll('.form-input').length;
  }

  public updateRenderMetrics(metrics: Partial<PerformanceMetrics['renderMetrics']>): void {
    this.metrics.renderMetrics = {
      ...this.metrics.renderMetrics,
      ...metrics,
    };
  }

  private checkThresholds(): void {
    const warnings: string[] = [];

    if (this.metrics.fps < this.thresholds.minFPS) {
      warnings.push(`FPS below threshold: ${this.metrics.fps} < ${this.thresholds.minFPS}`);
    }

    if (this.metrics.frameTime > this.thresholds.maxFrameTime) {
      warnings.push(`Frame time exceeds threshold: ${this.metrics.frameTime.toFixed(2)}ms`);
    }

    if (this.metrics.memory.percentage > this.thresholds.maxMemoryUsage) {
      warnings.push(`Memory usage high: ${(this.metrics.memory.percentage * 100).toFixed(1)}%`);
    }

    if (this.metrics.renderMetrics.nodeCount > this.thresholds.maxNodeCount) {
      warnings.push(`Node count exceeds threshold: ${this.metrics.renderMetrics.nodeCount}`);
    }

    if (this.metrics.renderMetrics.triangleCount > this.thresholds.maxTriangleCount) {
      warnings.push(
        `Triangle count exceeds threshold: ${this.metrics.renderMetrics.triangleCount}`
      );
    }

    if (warnings.length > 0) {
      this.handlePerformanceWarnings(warnings);
    }
  }

  private handlePerformanceWarnings(warnings: string[]): void {
    console.warn('Performance warnings:', warnings);

    // Trigger performance optimization strategies
    if (this.metrics.fps < 20) {
      this.triggerEmergencyOptimization();
    }
  }

  private triggerEmergencyOptimization(): void {
    console.warn('Triggering emergency performance optimization');

    // Dispatch custom event for the application to handle
    window.dispatchEvent(
      new CustomEvent('performance-critical', {
        detail: {
          metrics: this.metrics,
          action: 'reduce-quality',
        },
      })
    );
  }

  public observe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers(): void {
    this.observers.forEach((callback) => callback(this.metrics));
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPerformanceReport(): string {
    const report = [
      '=== Performance Report ===',
      `FPS: ${this.metrics.fps} (Target: ≥${this.thresholds.minFPS})`,
      `Frame Time: ${this.metrics.frameTime.toFixed(2)}ms`,
      `Memory: ${(this.metrics.memory.percentage * 100).toFixed(1)}%`,
      `Nodes: ${this.metrics.renderMetrics.nodeCount}`,
      `Triangles: ${(this.metrics.renderMetrics.triangleCount / 1000).toFixed(0)}K`,
      `Render Time: ${this.metrics.renderMetrics.renderTime.toFixed(2)}ms`,
      `Panels: ${this.metrics.componentMetrics.panelCount}`,
      `Inputs: ${this.metrics.componentMetrics.inputCount}`,
      '=========================',
    ].join('\n');

    return report;
  }

  public startRecording(duration: number = 5000): Promise<PerformanceMetrics[]> {
    const recordings: PerformanceMetrics[] = [];
    const interval = 100; // Record every 100ms

    return new Promise((resolve) => {
      const recordInterval = setInterval(() => {
        recordings.push(this.getMetrics());
      }, interval);

      setTimeout(() => {
        clearInterval(recordInterval);
        resolve(recordings);
      }, duration);
    });
  }

  public static measureComponentRender(componentName: string, renderFn: () => void): number {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);
    renderFn();
    performance.mark(endMark);

    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    return measure ? measure.duration : 0;
  }

  public static async profileWorkflow(
    workflowName: string,
    workflow: () => Promise<void>
  ): Promise<{ duration: number; memory: number }> {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const startTime = performance.now();

    await workflow();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return {
      duration: endTime - startTime,
      memory: endMemory - startMemory,
    };
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor();
  }
  return monitorInstance;
}

// React Hook for performance monitoring
import { useState, useEffect } from 'react';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const monitor = getPerformanceMonitor();
    monitor.start();

    const unsubscribe = monitor.observe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return metrics;
}

// Performance optimization utilities
export const PerformanceOptimizer = {
  shouldReduceQuality(metrics: PerformanceMetrics): boolean {
    return metrics.fps < 30 || metrics.memory.percentage > 0.85;
  },

  getQualitySettings(metrics: PerformanceMetrics): {
    shadows: boolean;
    antialiasing: boolean;
    maxTriangles: number;
    lodBias: number;
  } {
    if (metrics.fps < 20) {
      // Emergency mode
      return {
        shadows: false,
        antialiasing: false,
        maxTriangles: 100000,
        lodBias: 2,
      };
    } else if (metrics.fps < 30) {
      // Low quality
      return {
        shadows: false,
        antialiasing: true,
        maxTriangles: 500000,
        lodBias: 1,
      };
    } else if (metrics.fps < 45) {
      // Medium quality
      return {
        shadows: true,
        antialiasing: true,
        maxTriangles: 1000000,
        lodBias: 0.5,
      };
    } else {
      // High quality
      return {
        shadows: true,
        antialiasing: true,
        maxTriangles: 2000000,
        lodBias: 0,
      };
    }
  },

  throttleUpdates<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let lastCall = 0;
    let timeout: NodeJS.Timeout | null = null;

    return ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      } else if (!timeout) {
        timeout = setTimeout(
          () => {
            lastCall = Date.now();
            fn(...args);
            timeout = null;
          },
          delay - (now - lastCall)
        );
      }
    }) as T;
  },
};
