/**
 * System health monitoring and alerting
 */

import { SystemHealth, MonitoringConfig } from '../error-handling/types';
import { MetricsCollector } from './metrics-collector';
import { Logger } from '../logging/logger';
import { ErrorManager } from '../error-handling/error-manager';

export interface HealthAlert {
  id: string;
  type: 'memory' | 'error_rate' | 'performance' | 'wasm' | 'network';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  resolved?: boolean;
  resolvedAt?: number;
}

export interface HealthThresholds {
  memory: {
    warning: number; // MB
    critical: number; // MB
  };
  errorRate: {
    warning: number; // %
    critical: number; // %
  };
  responseTime: {
    warning: number; // ms
    critical: number; // ms
  };
  wasmMemory: {
    warning: number; // MB
    critical: number; // MB
  };
}

export class HealthMonitor {
  private static instance: HealthMonitor | null = null;
  private metricsCollector: MetricsCollector;
  private logger: Logger;
  private errorManager: ErrorManager;
  private alerts: Map<string, HealthAlert> = new Map();
  private thresholds: HealthThresholds;
  private monitoringInterval: number | null = null;
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds
  private onAlert?: (alert: HealthAlert) => void;

  private constructor(thresholds: HealthThresholds, onAlert?: (alert: HealthAlert) => void) {
    this.thresholds = thresholds;
    this.onAlert = onAlert;
    this.metricsCollector = MetricsCollector.getInstance();
    this.logger = Logger.getInstance();
    this.errorManager = ErrorManager.getInstance();

    this.startMonitoring();
  }

  public static getInstance(
    thresholds?: HealthThresholds,
    onAlert?: (alert: HealthAlert) => void
  ): HealthMonitor {
    if (!HealthMonitor.instance) {
      if (!thresholds) {
        throw new Error('HealthMonitor must be initialized with thresholds on first use');
      }
      HealthMonitor.instance = new HealthMonitor(thresholds, onAlert);
    }
    return HealthMonitor.instance;
  }

  /**
   * Start health monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.MONITORING_INTERVAL);

    // Initial health check
    setTimeout(() => this.performHealthCheck(), 1000);
  }

  /**
   * Stop health monitoring
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const health = this.metricsCollector.getSystemHealth();

      this.checkMemoryUsage(health);
      this.checkErrorRate(health);
      this.checkResponseTime(health);
      this.checkWasmMemory(health);
      this.checkSystemStatus();

      // Log health summary
      this.logger.debug('Health check completed', {
        memoryUsage: health.memoryUsage,
        errorRate: health.errorRate,
        responseTime: health.averageResponseTime,
        activeAlerts: this.getActiveAlerts().length,
      });
    } catch (error) {
      this.logger.error('Health check failed', { error });
    }
  }

  /**
   * Check memory usage against thresholds
   */
  private checkMemoryUsage(health: SystemHealth): void {
    const memoryMB = health.memoryUsage / (1024 * 1024);
    const alertId = 'memory_usage';

    if (memoryMB > this.thresholds.memory.critical) {
      this.createAlert(alertId, {
        type: 'memory',
        severity: 'critical',
        message: `Critical memory usage: ${memoryMB.toFixed(1)}MB (>${this.thresholds.memory.critical}MB)`,
      });
    } else if (memoryMB > this.thresholds.memory.warning) {
      this.createAlert(alertId, {
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${memoryMB.toFixed(1)}MB (>${this.thresholds.memory.warning}MB)`,
      });
    } else {
      this.resolveAlert(alertId);
    }
  }

  /**
   * Check error rate against thresholds
   */
  private checkErrorRate(health: SystemHealth): void {
    const errorRate = health.errorRate;
    const alertId = 'error_rate';

    if (errorRate > this.thresholds.errorRate.critical) {
      this.createAlert(alertId, {
        type: 'error_rate',
        severity: 'critical',
        message: `Critical error rate: ${errorRate.toFixed(1)}% (>${this.thresholds.errorRate.critical}%)`,
      });
    } else if (errorRate > this.thresholds.errorRate.warning) {
      this.createAlert(alertId, {
        type: 'error_rate',
        severity: 'warning',
        message: `High error rate: ${errorRate.toFixed(1)}% (>${this.thresholds.errorRate.warning}%)`,
      });
    } else {
      this.resolveAlert(alertId);
    }
  }

  /**
   * Check response time against thresholds
   */
  private checkResponseTime(health: SystemHealth): void {
    const responseTime = health.averageResponseTime;
    const alertId = 'response_time';

    if (responseTime > this.thresholds.responseTime.critical) {
      this.createAlert(alertId, {
        type: 'performance',
        severity: 'critical',
        message: `Critical response time: ${responseTime.toFixed(0)}ms (>${this.thresholds.responseTime.critical}ms)`,
      });
    } else if (responseTime > this.thresholds.responseTime.warning) {
      this.createAlert(alertId, {
        type: 'performance',
        severity: 'warning',
        message: `Slow response time: ${responseTime.toFixed(0)}ms (>${this.thresholds.responseTime.warning}ms)`,
      });
    } else {
      this.resolveAlert(alertId);
    }
  }

  /**
   * Check WASM memory usage if available
   */
  private checkWasmMemory(health: SystemHealth): void {
    if (!health.wasmMemoryUsage) return;

    const wasmMemoryMB = health.wasmMemoryUsage / (1024 * 1024);
    const alertId = 'wasm_memory';

    if (wasmMemoryMB > this.thresholds.wasmMemory.critical) {
      this.createAlert(alertId, {
        type: 'wasm',
        severity: 'critical',
        message: `Critical WASM memory usage: ${wasmMemoryMB.toFixed(1)}MB (>${this.thresholds.wasmMemory.critical}MB)`,
      });
    } else if (wasmMemoryMB > this.thresholds.wasmMemory.warning) {
      this.createAlert(alertId, {
        type: 'wasm',
        severity: 'warning',
        message: `High WASM memory usage: ${wasmMemoryMB.toFixed(1)}MB (>${this.thresholds.wasmMemory.warning}MB)`,
      });
    } else {
      this.resolveAlert(alertId);
    }
  }

  /**
   * Check general system status
   */
  private checkSystemStatus(): void {
    // Check if WASM is available
    if (!crossOriginIsolated) {
      this.createAlert('wasm_unavailable', {
        type: 'wasm',
        severity: 'warning',
        message: 'SharedArrayBuffer unavailable - WASM performance limited',
      });
    } else {
      this.resolveAlert('wasm_unavailable');
    }

    // Check for network connectivity
    if (!navigator.onLine) {
      this.createAlert('network_offline', {
        type: 'network',
        severity: 'critical',
        message: 'Network connection lost',
      });
    } else {
      this.resolveAlert('network_offline');
    }
  }

  /**
   * Create or update an alert
   */
  private createAlert(id: string, alertData: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    const existingAlert = this.alerts.get(id);

    // Don't create duplicate alerts
    if (existingAlert && !existingAlert.resolved) {
      return;
    }

    const alert: HealthAlert = {
      id,
      ...alertData,
      timestamp: Date.now(),
    };

    this.alerts.set(id, alert);

    // Log the alert
    this.logger.warn('Health alert triggered', { alert });

    // Call alert handler
    this.onAlert?.(alert);

    // Update metrics
    this.metricsCollector.incrementCounter('health_alerts_total', {
      type: alert.type,
      severity: alert.severity,
    });
  }

  /**
   * Resolve an alert
   */
  private resolveAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();

      this.logger.info('Health alert resolved', { alertId: id });

      this.metricsCollector.incrementCounter('health_alerts_resolved_total', {
        type: alert.type,
        severity: alert.severity,
      });
    }
  }

  /**
   * Get all active alerts
   */
  public getActiveAlerts(): HealthAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved);
  }

  /**
   * Get all alerts (including resolved)
   */
  public getAllAlerts(): HealthAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alerts by type
   */
  public getAlertsByType(type: HealthAlert['type']): HealthAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.type === type);
  }

  /**
   * Get alerts by severity
   */
  public getAlertsBySeverity(severity: HealthAlert['severity']): HealthAlert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.severity === severity);
  }

  /**
   * Clear old resolved alerts
   */
  public clearOldAlerts(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThanMs;
    const toDelete: string[] = [];

    for (const [id, alert] of this.alerts) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoff) {
        toDelete.push(id);
      }
    }

    toDelete.forEach((id) => this.alerts.delete(id));
  }

  /**
   * Get current system health
   */
  public getCurrentHealth(): SystemHealth {
    return this.metricsCollector.getSystemHealth();
  }

  /**
   * Manual health check trigger
   */
  public async triggerHealthCheck(): Promise<SystemHealth> {
    await this.performHealthCheck();
    return this.getCurrentHealth();
  }

  /**
   * Update thresholds
   */
  public updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds,
    };

    this.logger.info('Health thresholds updated', { thresholds: this.thresholds });
  }

  /**
   * Export health report for external monitoring
   */
  public exportHealthReport(): {
    currentHealth: SystemHealth;
    activeAlerts: HealthAlert[];
    thresholds: HealthThresholds;
    lastCheckTime: number;
  } {
    return {
      currentHealth: this.getCurrentHealth(),
      activeAlerts: this.getActiveAlerts(),
      thresholds: this.thresholds,
      lastCheckTime: Date.now(),
    };
  }
}
