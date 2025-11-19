/**
 * Node-specific performance monitoring and metrics collection
 */

import { PerformanceMetric } from '../error-handling/types';
import { MetricsCollector } from './metrics-collector';

export interface NodeMetrics {
  nodeId: string;
  nodeType: string;
  computeTime: number; // milliseconds
  memoryUsage: number; // bytes
  lastEvaluated: Date;
  evaluationCount: number;
  averageComputeTime: number;
  peakMemoryUsage: number;
  errorCount: number;
  successRate: number; // percentage
}

export interface NodePerformanceData {
  metrics: NodeMetrics;
  history: PerformanceMetric[];
  trends: {
    computeTimeGrowth: number; // percentage change
    memoryGrowth: number; // percentage change
    reliability: number; // success rate trend
  };
}

export class NodeMetricsCollector {
  private static instance: NodeMetricsCollector | null = null;
  private nodeMetrics: Map<string, NodeMetrics> = new Map();
  private nodeHistory: Map<string, PerformanceMetric[]> = new Map();
  private metricsCollector: MetricsCollector;
  private readonly MAX_HISTORY_SIZE = 100;

  private constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
  }

  public static getInstance(): NodeMetricsCollector {
    if (!NodeMetricsCollector.instance) {
      NodeMetricsCollector.instance = new NodeMetricsCollector();
    }
    return NodeMetricsCollector.instance;
  }

  /**
   * Record node evaluation start
   */
  public startNodeEvaluation(nodeId: string, nodeType: string): void {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    // Store start time for this evaluation
    this.metricsCollector.recordCounter(`node_evaluation_start_${nodeId}`, startTime);
    this.metricsCollector.recordGauge(`node_memory_start_${nodeId}`, startMemory);
  }

  /**
   * Record node evaluation completion
   */
  public endNodeEvaluation(nodeId: string, nodeType: string, success: boolean = true): void {
    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();

    // Get start metrics
    const startTime =
      this.metricsCollector.getCounter(`node_evaluation_start_${nodeId}`) || endTime;
    const startMemory = this.metricsCollector.getGauge(`node_memory_start_${nodeId}`) || endMemory;

    const computeTime = endTime - startTime;
    const memoryUsed = Math.max(0, endMemory - startMemory);

    // Update node metrics
    this.updateNodeMetrics(nodeId, nodeType, computeTime, memoryUsed, success);

    // Record performance metrics
    this.recordPerformanceMetric(nodeId, 'compute_time', computeTime, 'ms');
    this.recordPerformanceMetric(nodeId, 'memory_usage', memoryUsed, 'bytes');
    this.recordPerformanceMetric(nodeId, 'success', success ? 1 : 0, 'boolean');

    // Clean up temporary metrics
    this.metricsCollector.removeCounter(`node_evaluation_start_${nodeId}`);
    this.metricsCollector.removeGauge(`node_memory_start_${nodeId}`);
  }

  /**
   * Get metrics for a specific node
   */
  public getNodeMetrics(nodeId: string): NodeMetrics | null {
    return this.nodeMetrics.get(nodeId) || null;
  }

  /**
   * Get performance data for a node including history and trends
   */
  public getNodePerformanceData(nodeId: string): NodePerformanceData | null {
    const metrics = this.nodeMetrics.get(nodeId);
    const history = this.nodeHistory.get(nodeId) || [];

    if (!metrics) {
      return null;
    }

    // Calculate trends
    const trends = this.calculateTrends(history);

    return {
      metrics,
      history,
      trends,
    };
  }

  /**
   * Get metrics for all nodes
   */
  public getAllNodeMetrics(): Map<string, NodeMetrics> {
    return new Map(this.nodeMetrics);
  }

  /**
   * Clear metrics for a specific node
   */
  public clearNodeMetrics(nodeId: string): void {
    this.nodeMetrics.delete(nodeId);
    this.nodeHistory.delete(nodeId);
  }

  /**
   * Get performance summary for all nodes
   */
  public getPerformanceSummary(): {
    totalNodes: number;
    averageComputeTime: number;
    totalMemoryUsage: number;
    overallSuccessRate: number;
    slowestNode: { nodeId: string; computeTime: number } | null;
    heaviestNode: { nodeId: string; memoryUsage: number } | null;
  } {
    const allMetrics = Array.from(this.nodeMetrics.values());

    if (allMetrics.length === 0) {
      return {
        totalNodes: 0,
        averageComputeTime: 0,
        totalMemoryUsage: 0,
        overallSuccessRate: 100,
        slowestNode: null,
        heaviestNode: null,
      };
    }

    const totalComputeTime = allMetrics.reduce((sum, m) => sum + m.averageComputeTime, 0);
    const totalMemory = allMetrics.reduce((sum, m) => sum + m.peakMemoryUsage, 0);
    const totalEvaluations = allMetrics.reduce((sum, m) => sum + m.evaluationCount, 0);
    const totalSuccesses = allMetrics.reduce(
      (sum, m) => sum + (m.evaluationCount * m.successRate) / 100,
      0
    );

    const slowestNode = allMetrics.reduce((slowest, current) =>
      !slowest || current.averageComputeTime > slowest.averageComputeTime ? current : slowest
    );

    const heaviestNode = allMetrics.reduce((heaviest, current) =>
      !heaviest || current.peakMemoryUsage > heaviest.peakMemoryUsage ? current : heaviest
    );

    return {
      totalNodes: allMetrics.length,
      averageComputeTime: totalComputeTime / allMetrics.length,
      totalMemoryUsage: totalMemory,
      overallSuccessRate: totalEvaluations > 0 ? (totalSuccesses / totalEvaluations) * 100 : 100,
      slowestNode: slowestNode
        ? { nodeId: slowestNode.nodeId, computeTime: slowestNode.averageComputeTime }
        : null,
      heaviestNode: heaviestNode
        ? { nodeId: heaviestNode.nodeId, memoryUsage: heaviestNode.peakMemoryUsage }
        : null,
    };
  }

  private updateNodeMetrics(
    nodeId: string,
    nodeType: string,
    computeTime: number,
    memoryUsed: number,
    success: boolean
  ): void {
    const existing = this.nodeMetrics.get(nodeId);

    if (!existing) {
      // Create new metrics
      this.nodeMetrics.set(nodeId, {
        nodeId,
        nodeType,
        computeTime,
        memoryUsage: memoryUsed,
        lastEvaluated: new Date(),
        evaluationCount: 1,
        averageComputeTime: computeTime,
        peakMemoryUsage: memoryUsed,
        errorCount: success ? 0 : 1,
        successRate: success ? 100 : 0,
      });
    } else {
      // Update existing metrics
      const newEvaluationCount = existing.evaluationCount + 1;
      const newErrorCount = existing.errorCount + (success ? 0 : 1);
      const newAverageComputeTime =
        (existing.averageComputeTime * existing.evaluationCount + computeTime) / newEvaluationCount;

      this.nodeMetrics.set(nodeId, {
        ...existing,
        computeTime,
        memoryUsage: memoryUsed,
        lastEvaluated: new Date(),
        evaluationCount: newEvaluationCount,
        averageComputeTime: newAverageComputeTime,
        peakMemoryUsage: Math.max(existing.peakMemoryUsage, memoryUsed),
        errorCount: newErrorCount,
        successRate: ((newEvaluationCount - newErrorCount) / newEvaluationCount) * 100,
      });
    }
  }

  private recordPerformanceMetric(
    nodeId: string,
    metricName: string,
    value: number,
    unit: string
  ): void {
    const metric: PerformanceMetric = {
      name: `node_${metricName}`,
      value,
      unit,
      timestamp: Date.now(),
      labels: {
        nodeId,
        nodeType: this.nodeMetrics.get(nodeId)?.nodeType || 'unknown',
      },
    };

    // Add to node history
    const history = this.nodeHistory.get(nodeId) || [];
    history.push(metric);

    // Keep only recent history
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.splice(0, history.length - this.MAX_HISTORY_SIZE);
    }

    this.nodeHistory.set(nodeId, history);

    // Record in global metrics collector
    this.metricsCollector.recordMetric(metric);
  }

  private calculateTrends(history: PerformanceMetric[]): {
    computeTimeGrowth: number;
    memoryGrowth: number;
    reliability: number;
  } {
    if (history.length < 10) {
      return {
        computeTimeGrowth: 0,
        memoryGrowth: 0,
        reliability: 100,
      };
    }

    // Get recent metrics for trend calculation
    const recentHistory = history.slice(-20);
    const olderHistory = history.slice(-40, -20);

    const recentComputeTime =
      recentHistory
        .filter((m) => m.name === 'node_compute_time')
        .reduce((sum, m) => sum + m.value, 0) /
      recentHistory.filter((m) => m.name === 'node_compute_time').length;

    const olderComputeTime =
      olderHistory
        .filter((m) => m.name === 'node_compute_time')
        .reduce((sum, m) => sum + m.value, 0) /
      olderHistory.filter((m) => m.name === 'node_compute_time').length;

    const recentMemory =
      recentHistory
        .filter((m) => m.name === 'node_memory_usage')
        .reduce((sum, m) => sum + m.value, 0) /
      recentHistory.filter((m) => m.name === 'node_memory_usage').length;

    const olderMemory =
      olderHistory
        .filter((m) => m.name === 'node_memory_usage')
        .reduce((sum, m) => sum + m.value, 0) /
      olderHistory.filter((m) => m.name === 'node_memory_usage').length;

    const recentSuccesses = recentHistory
      .filter((m) => m.name === 'node_success')
      .reduce((sum, m) => sum + m.value, 0);

    const computeTimeGrowth =
      olderComputeTime > 0 ? ((recentComputeTime - olderComputeTime) / olderComputeTime) * 100 : 0;
    const memoryGrowth = olderMemory > 0 ? ((recentMemory - olderMemory) / olderMemory) * 100 : 0;
    const reliability =
      (recentSuccesses / recentHistory.filter((m) => m.name === 'node_success').length) * 100;

    return {
      computeTimeGrowth,
      memoryGrowth,
      reliability,
    };
  }

  private getCurrentMemoryUsage(): number {
    // Estimate memory usage
    if ('memory' in performance) {
      return (performance as unknown).memory.usedJSHeapSize || 0;
    }
    return 0;
  }
}
