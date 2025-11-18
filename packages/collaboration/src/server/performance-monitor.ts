/**
 * PerformanceMonitor - Tracks collaboration performance metrics
 *
 * Monitors operation latency, conflict rates, connection quality, and
 * document metrics to provide visibility into collaboration health.
 *
 * Features:
 * - Real-time metric tracking
 * - Sliding window aggregates
 * - Threshold-based alerting
 * - Histogram support for latency
 */
export class PerformanceMonitor {
  private operationMetrics: OperationMetric[] = [];
  private conflictMetrics: ConflictMetric[] = [];
  private connectionMetrics: ConnectionMetric[] = [];
  private documentMetrics: Map<string, DocumentMetric> = new Map();
  private readonly retentionPeriod: number;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(options: PerformanceMonitorOptions = {}) {
    this.retentionPeriod = options.retentionPeriod ?? 3600000; // 1 hour default

    // Start periodic cleanup of old metrics
    this.startCleanup();
  }

  /**
   * Record an operation with latency
   */
  recordOperation(latency: number, success: boolean = true, documentId?: string): void {
    this.operationMetrics.push({
      timestamp: Date.now(),
      latency,
      success,
      documentId,
    });
  }

  /**
   * Record a conflict event
   */
  recordConflict(resolutionTime: number, conflictType: ConflictType, documentId?: string): void {
    this.conflictMetrics.push({
      timestamp: Date.now(),
      resolutionTime,
      conflictType,
      documentId,
    });
  }

  /**
   * Record a connection event
   */
  recordConnection(event: ConnectionEvent, userId?: string, reason?: string): void {
    this.connectionMetrics.push({
      timestamp: Date.now(),
      event,
      userId,
      reason,
    });
  }

  /**
   * Update document metrics
   */
  updateDocumentMetrics(documentId: string, metrics: Partial<DocumentMetric>): void {
    const existing = this.documentMetrics.get(documentId) || {
      documentId,
      size: 0,
      operationCount: 0,
      snapshotCount: 0,
      memoryUsage: 0,
      lastUpdated: Date.now(),
    };

    this.documentMetrics.set(documentId, {
      ...existing,
      ...metrics,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Recent operations (last minute)
    const recentOps = this.operationMetrics.filter((m) => m.timestamp > oneMinuteAgo);

    // Recent conflicts (last minute)
    const recentConflicts = this.conflictMetrics.filter((m) => m.timestamp > oneMinuteAgo);

    // Recent connections (last minute)
    const recentConnections = this.connectionMetrics.filter((m) => m.timestamp > oneMinuteAgo);

    // Calculate operation stats
    const successfulOps = recentOps.filter((m) => m.success);
    const avgLatency =
      successfulOps.length > 0
        ? successfulOps.reduce((sum, m) => sum + m.latency, 0) / successfulOps.length
        : 0;

    const latencies = successfulOps.map((m) => m.latency).sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

    return {
      timestamp: now,
      operations: {
        total: recentOps.length,
        successful: successfulOps.length,
        failed: recentOps.length - successfulOps.length,
        throughput: recentOps.length / 60, // ops/second (averaged over minute)
        latency: {
          average: avgLatency,
          p50,
          p95,
          p99,
          min: latencies[0] || 0,
          max: latencies[latencies.length - 1] || 0,
        },
      },
      conflicts: {
        total: recentConflicts.length,
        rate: recentOps.length > 0 ? recentConflicts.length / recentOps.length : 0,
        averageResolutionTime:
          recentConflicts.length > 0
            ? recentConflicts.reduce((sum, m) => sum + m.resolutionTime, 0) / recentConflicts.length
            : 0,
        byType: this.groupConflictsByType(recentConflicts),
      },
      connections: {
        connects: recentConnections.filter((m) => m.event === 'connect').length,
        disconnects: recentConnections.filter((m) => m.event === 'disconnect').length,
        reconnects: recentConnections.filter((m) => m.event === 'reconnect').length,
        activeConnections: this.getActiveConnectionCount(),
      },
      documents: Array.from(this.documentMetrics.values()),
    };
  }

  /**
   * Get aggregated metrics over a time window
   */
  getAggregates(timeWindow: number = 3600000): AggregateMetrics {
    const now = Date.now();
    const windowStart = now - timeWindow;

    const windowOps = this.operationMetrics.filter((m) => m.timestamp > windowStart);
    const windowConflicts = this.conflictMetrics.filter((m) => m.timestamp > windowStart);

    const successfulOps = windowOps.filter((m) => m.success);
    const latencies = successfulOps.map((m) => m.latency);

    return {
      timeWindow,
      totalOperations: windowOps.length,
      successRate: windowOps.length > 0 ? successfulOps.length / windowOps.length : 0,
      averageLatency:
        latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0,
      totalConflicts: windowConflicts.length,
      conflictRate: windowOps.length > 0 ? windowConflicts.length / windowOps.length : 0,
      peakThroughput: this.calculatePeakThroughput(windowOps),
    };
  }

  /**
   * Get alerts based on threshold violations
   */
  getAlerts(): Alert[] {
    const metrics = this.getMetrics();
    const alerts: Alert[] = [];

    // High latency alert
    if (metrics.operations.latency.p95 > 1000) {
      alerts.push({
        severity: 'warning',
        type: 'high_latency',
        message: `P95 latency is ${metrics.operations.latency.p95.toFixed(0)}ms (threshold: 1000ms)`,
        value: metrics.operations.latency.p95,
        threshold: 1000,
      });
    }

    // High conflict rate alert
    if (metrics.conflicts.rate > 0.1) {
      alerts.push({
        severity: 'warning',
        type: 'high_conflict_rate',
        message: `Conflict rate is ${(metrics.conflicts.rate * 100).toFixed(1)}% (threshold: 10%)`,
        value: metrics.conflicts.rate,
        threshold: 0.1,
      });
    }

    // High reconnection rate
    const reconnectionRate =
      metrics.connections.connects > 0
        ? metrics.connections.reconnects / metrics.connections.connects
        : 0;
    if (reconnectionRate > 0.2) {
      alerts.push({
        severity: 'warning',
        type: 'high_reconnection_rate',
        message: `Reconnection rate is ${(reconnectionRate * 100).toFixed(1)}% (threshold: 20%)`,
        value: reconnectionRate,
        threshold: 0.2,
      });
    }

    // High memory usage per document
    for (const doc of metrics.documents) {
      if (doc.memoryUsage > 500 * 1024 * 1024) {
        // 500MB
        alerts.push({
          severity: 'error',
          type: 'high_memory_usage',
          message: `Document ${doc.documentId} is using ${(doc.memoryUsage / 1024 / 1024).toFixed(0)}MB (threshold: 500MB)`,
          value: doc.memoryUsage,
          threshold: 500 * 1024 * 1024,
          documentId: doc.documentId,
        });
      }
    }

    return alerts;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.operationMetrics = [];
    this.conflictMetrics = [];
    this.connectionMetrics = [];
    this.documentMetrics.clear();
  }

  /**
   * Cleanup old metrics beyond retention period
   */
  cleanupOldMetrics(): number {
    const now = Date.now();
    const cutoff = now - this.retentionPeriod;
    let cleaned = 0;

    const initialOpCount = this.operationMetrics.length;
    this.operationMetrics = this.operationMetrics.filter((m) => m.timestamp > cutoff);
    cleaned += initialOpCount - this.operationMetrics.length;

    const initialConflictCount = this.conflictMetrics.length;
    this.conflictMetrics = this.conflictMetrics.filter((m) => m.timestamp > cutoff);
    cleaned += initialConflictCount - this.conflictMetrics.length;

    const initialConnectionCount = this.connectionMetrics.length;
    this.connectionMetrics = this.connectionMetrics.filter((m) => m.timestamp > cutoff);
    cleaned += initialConnectionCount - this.connectionMetrics.length;

    return cleaned;
  }

  /**
   * Destroy monitor and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  // Private methods

  private groupConflictsByType(conflicts: ConflictMetric[]): Record<ConflictType, number> {
    const grouped: Record<ConflictType, number> = {
      'update-update': 0,
      'delete-update': 0,
      'add-add': 0,
      other: 0,
    };

    for (const conflict of conflicts) {
      grouped[conflict.conflictType]++;
    }

    return grouped;
  }

  private getActiveConnectionCount(): number {
    const now = Date.now();
    const recent = now - 60000; // Last minute

    const recentEvents = this.connectionMetrics.filter((m) => m.timestamp > recent);
    const connects = recentEvents.filter((m) => m.event === 'connect').length;
    const disconnects = recentEvents.filter((m) => m.event === 'disconnect').length;

    // Approximate active connections (not exact, but useful for monitoring)
    return Math.max(0, connects - disconnects);
  }

  private calculatePeakThroughput(operations: OperationMetric[]): number {
    if (operations.length === 0) return 0;

    // Group operations by second and find peak
    const bySecond: Map<number, number> = new Map();

    for (const op of operations) {
      const second = Math.floor(op.timestamp / 1000);
      bySecond.set(second, (bySecond.get(second) || 0) + 1);
    }

    return Math.max(...Array.from(bySecond.values()));
  }

  private startCleanup(): void {
    // Cleanup every 5 minutes
    this.cleanupTimer = setInterval(() => {
      const cleaned = this.cleanupOldMetrics();
      if (cleaned > 0) {
        console.log(`Cleaned up ${cleaned} old metrics beyond retention period`);
      }
    }, 300000);
  }
}

export interface PerformanceMonitorOptions {
  retentionPeriod?: number; // How long to keep metrics (milliseconds)
}

interface OperationMetric {
  timestamp: number;
  latency: number;
  success: boolean;
  documentId?: string;
}

interface ConflictMetric {
  timestamp: number;
  resolutionTime: number;
  conflictType: ConflictType;
  documentId?: string;
}

interface ConnectionMetric {
  timestamp: number;
  event: ConnectionEvent;
  userId?: string;
  reason?: string;
}

export interface DocumentMetric {
  documentId: string;
  size: number; // Bytes
  operationCount: number;
  snapshotCount: number;
  memoryUsage: number; // Bytes
  lastUpdated: number;
}

export type ConflictType = 'update-update' | 'delete-update' | 'add-add' | 'other';
export type ConnectionEvent = 'connect' | 'disconnect' | 'reconnect';

export interface PerformanceMetrics {
  timestamp: number;
  operations: {
    total: number;
    successful: number;
    failed: number;
    throughput: number; // ops/second
    latency: {
      average: number;
      p50: number;
      p95: number;
      p99: number;
      min: number;
      max: number;
    };
  };
  conflicts: {
    total: number;
    rate: number; // conflicts / operations
    averageResolutionTime: number;
    byType: Record<ConflictType, number>;
  };
  connections: {
    connects: number;
    disconnects: number;
    reconnects: number;
    activeConnections: number;
  };
  documents: DocumentMetric[];
}

export interface AggregateMetrics {
  timeWindow: number;
  totalOperations: number;
  successRate: number;
  averageLatency: number;
  totalConflicts: number;
  conflictRate: number;
  peakThroughput: number;
}

export interface Alert {
  severity: 'info' | 'warning' | 'error';
  type: string;
  message: string;
  value: number;
  threshold: number;
  documentId?: string;
}
