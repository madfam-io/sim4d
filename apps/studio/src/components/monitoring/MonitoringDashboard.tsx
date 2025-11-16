/**
 * Monitoring dashboard component for development and debugging
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MonitoringSystem } from '../../lib/monitoring/monitoring-system';
import { HealthAlert } from '../../lib/monitoring/health-monitor';
import { BrepFlowError } from '../../lib/error-handling/types';
import styles from './MonitoringDashboard.module.css';

interface MonitoringDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ isVisible, onClose }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'health' | 'errors' | 'metrics' | 'logs'>(
    'health'
  );
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const refreshData = useCallback(() => {
    try {
      const monitoringSystem = MonitoringSystem.getInstance();
      const data = monitoringSystem.getMonitoringDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      refreshData();

      // Auto-refresh every 5 seconds when visible
      const interval = setInterval(refreshData, 5000);
      setRefreshInterval(Number(interval));

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [isVisible, refreshData]);

  if (!isVisible || !dashboardData) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const renderHealthTab = () => (
    <div className={styles['monitoring-tab-content']}>
      <div className={styles['health-overview']}>
        <h3>System Health</h3>
        <div className={styles['health-metrics']}>
          <div className={styles.metric}>
            <label>Memory Usage:</label>
            <span>{formatBytes(dashboardData.systemHealth.memoryUsage)}</span>
          </div>
          <div className={styles.metric}>
            <label>Error Rate:</label>
            <span
              style={{ color: dashboardData.systemHealth.errorRate > 5 ? '#dc2626' : '#10b981' }}
            >
              {formatPercent(dashboardData.systemHealth.errorRate)}
            </span>
          </div>
          <div className={styles.metric}>
            <label>Avg Response Time:</label>
            <span
              style={{
                color:
                  dashboardData.systemHealth.averageResponseTime > 1000 ? '#f59e0b' : '#10b981',
              }}
            >
              {dashboardData.systemHealth.averageResponseTime.toFixed(0)}ms
            </span>
          </div>
          <div className={styles.metric}>
            <label>Active Workers:</label>
            <span>{dashboardData.systemHealth.activeWorkers}</span>
          </div>
        </div>
      </div>

      <div className={styles['active-alerts']}>
        <h3>Active Alerts ({dashboardData.activeAlerts.length})</h3>
        {dashboardData.activeAlerts.length === 0 ? (
          <p className={styles['no-alerts']}>✅ No active alerts</p>
        ) : (
          <div className={styles['alerts-list']}>
            {dashboardData.activeAlerts.map((alert: HealthAlert) => (
              <div
                key={alert.id}
                className={styles['alert-item']}
                style={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}
              >
                <div className={styles['alert-header']}>
                  <span className={styles['alert-type']}>{alert.type}</span>
                  <span
                    className={styles['alert-severity']}
                    style={{ color: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                  <span className={styles['alert-time']}>{formatTime(alert.timestamp)}</span>
                </div>
                <div className={styles['alert-message']}>{alert.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderErrorsTab = () => (
    <div className={styles['monitoring-tab-content']}>
      <div className={styles['errors-overview']}>
        <h3>Recent Errors ({dashboardData.activeErrors.length} active)</h3>
        {dashboardData.activeErrors.length === 0 ? (
          <p className={styles['no-errors']}>✅ No active errors</p>
        ) : (
          <div className={styles['errors-list']}>
            {dashboardData.activeErrors.slice(0, 10).map((error: BrepFlowError) => (
              <div key={error.id} className={styles['error-item']}>
                <div className={styles['error-header']}>
                  <span className={styles['error-code']}>{error.code}</span>
                  <span
                    className={styles['error-severity']}
                    style={{ color: getSeverityColor(error.severity) }}
                  >
                    {error.severity}
                  </span>
                  <span className={styles['error-time']}>
                    {formatTime(error.occurredAt.getTime())}
                  </span>
                </div>
                <div className={styles['error-message']}>{error.userMessage}</div>
                {error.context.nodeId && (
                  <div className={styles['error-context']}>Node: {error.context.nodeId}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className={styles['monitoring-tab-content']}>
      <div className={styles['metrics-overview']}>
        <h3>Performance Metrics</h3>

        <div className={styles['metrics-section']}>
          <h4>Counters</h4>
          <div className={styles['metrics-grid']}>
            {Object.entries(dashboardData.metrics.counters).map(([key, value]) => (
              <div key={key} className={styles['metric-item']}>
                <label>{key}:</label>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles['metrics-section']}>
          <h4>Gauges</h4>
          <div className={styles['metrics-grid']}>
            {Object.entries(dashboardData.metrics.gauges).map(([key, value]) => (
              <div key={key} className={styles['metric-item']}>
                <label>{key}:</label>
                <span>
                  {typeof value === 'number'
                    ? key.includes('bytes')
                      ? formatBytes(value as number)
                      : value
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles['metrics-section']}>
          <h4>Response Times</h4>
          <div className={styles['metrics-grid']}>
            {Object.entries(dashboardData.metrics.histograms).map(([key, stats]: [string, any]) => (
              <div key={key} className={styles['histogram-item']}>
                <label>{key}:</label>
                <div className={styles['histogram-stats']}>
                  <span>Avg: {stats.avg.toFixed(1)}ms</span>
                  <span>P95: {stats.p95.toFixed(1)}ms</span>
                  <span>Count: {stats.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className={styles['monitoring-tab-content']}>
      <div className={styles['logs-overview']}>
        <h3>System Logs</h3>
        <p>Logs are available in the browser console. Enable remote logging to view them here.</p>
        <div className={styles['log-controls']}>
          <button onClick={() => console.clear()}>Clear Console</button>
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow && (newWindow as any).console) {
                (newWindow as any).console.log('Console opened');
              }
            }}
          >
            Open Console
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles['monitoring-dashboard-overlay']}>
      <div className={styles['monitoring-dashboard']}>
        <div className={styles['dashboard-header']}>
          <h2>🔧 Monitoring Dashboard</h2>
          <div className={styles['dashboard-controls']}>
            <button onClick={refreshData} className={styles['refresh-btn']}>
              🔄 Refresh
            </button>
            <button onClick={onClose} className={styles['close-btn']}>
              ✕
            </button>
          </div>
        </div>

        <div className={styles['dashboard-tabs']}>
          <button
            className={`${styles.tab} ${selectedTab === 'health' ? styles.active : ''}`}
            onClick={() => setSelectedTab('health')}
          >
            Health
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'errors' ? styles.active : ''}`}
            onClick={() => setSelectedTab('errors')}
          >
            Errors ({dashboardData.activeErrors.length})
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'metrics' ? styles.active : ''}`}
            onClick={() => setSelectedTab('metrics')}
          >
            Metrics
          </button>
          <button
            className={`${styles.tab} ${selectedTab === 'logs' ? styles.active : ''}`}
            onClick={() => setSelectedTab('logs')}
          >
            Logs
          </button>
        </div>

        <div className={styles['dashboard-content']}>
          {selectedTab === 'health' && renderHealthTab()}
          {selectedTab === 'errors' && renderErrorsTab()}
          {selectedTab === 'metrics' && renderMetricsTab()}
          {selectedTab === 'logs' && renderLogsTab()}
        </div>
      </div>
    </div>
  );
};
