# Sim4D Studio - Monitoring & Error Handling System

This document describes the comprehensive error handling and monitoring system implemented for Sim4D Studio.

## Overview

The monitoring system provides:

- **Error Handling**: Comprehensive error catching, reporting, and user-friendly recovery
- **Performance Monitoring**: Real-time metrics collection and analysis
- **Health Monitoring**: System health checks with configurable alerts
- **User Analytics**: Privacy-respecting usage analytics
- **Logging**: Structured logging with multiple output targets

## Quick Start

The monitoring system is automatically initialized when the application starts:

```typescript
import { initializeMonitoring } from './lib/monitoring';

// Initialize with environment-specific configuration
await initializeMonitoring('development');
```

## Architecture

### Core Components

1. **ErrorManager** - Central error handling and reporting
2. **MetricsCollector** - Performance metrics and system monitoring
3. **HealthMonitor** - System health checks and alerting
4. **Logger** - Structured logging with multiple outputs
5. **RetryHandler** - Intelligent retry logic for transient failures

### React Integration

- **Error Boundaries** - Catch React component errors gracefully
- **Custom Hooks** - Easy integration with React components
- **Monitoring Dashboard** - Real-time monitoring interface

## Error Handling

### Error Categories

- **GEOMETRY** - CAD geometry computation errors
- **WASM** - WebAssembly execution errors
- **NETWORK** - API and network connectivity errors
- **VALIDATION** - Data validation and constraint errors
- **RUNTIME** - JavaScript runtime errors
- **USER_INPUT** - Invalid user input errors
- **SYSTEM** - Browser and system-level errors
- **UI** - User interface and rendering errors

### Error Boundaries

The system includes specialized error boundaries:

```typescript
// General error boundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// WASM-specific error boundary
<WASMErrorBoundary>
  <GeometryComponent />
</WASMErrorBoundary>

// Geometry operation error boundary
<GeometryErrorBoundary>
  <CADOperations />
</GeometryErrorBoundary>
```

### Error Recovery

Errors include automatic recovery actions:

```typescript
const error = errorManager.createError(
  ErrorCode.GEOMETRY_COMPUTATION_FAILED,
  'Failed to compute geometry',
  {
    recoveryActions: [
      {
        id: 'retry',
        label: 'Try Again',
        action: () => retryOperation(),
      },
      {
        id: 'reset',
        label: 'Reset Parameters',
        action: () => resetToDefaults(),
        requiresConfirmation: true,
      },
    ],
  }
);
```

## Performance Monitoring

### Metrics Types

- **Counters** - Incremental counts (errors, user actions)
- **Gauges** - Current values (memory usage, active connections)
- **Histograms** - Distribution of values (response times, operation durations)
- **Timers** - Operation timing measurements

### Usage Examples

```typescript
import { usePerformanceMetrics } from './hooks/useMonitoring';

const { recordTiming, incrementCounter, setGauge } = usePerformanceMetrics();

// Record timing
const endTiming = metricsCollector.startTiming('operation');
await performOperation();
endTiming({ operation: 'geometry_creation', status: 'success' });

// Increment counter
incrementCounter('user_actions', { type: 'node_create' });

// Set gauge
setGauge('active_nodes', graph.nodes.length);
```

### Automatic Metrics

The system automatically collects:

- Page load times and performance
- Memory usage and garbage collection
- Network request performance
- User interaction patterns
- Frame rate and rendering performance

## Health Monitoring

### Configurable Thresholds

```typescript
const healthThresholds = {
  memory: {
    warning: 500, // MB
    critical: 1000, // MB
  },
  errorRate: {
    warning: 5, // %
    critical: 15, // %
  },
  responseTime: {
    warning: 1000, // ms
    critical: 5000, // ms
  },
};
```

### Health Alerts

Health alerts are automatically generated and can be handled:

```typescript
import { useHealthMonitoring } from './hooks/useMonitoring';

const { alerts, dismissAlert } = useHealthMonitoring();

// Display alerts to user
alerts.forEach((alert) => {
  console.log(`${alert.severity}: ${alert.message}`);
});
```

## Logging

### Log Levels

- **DEBUG** - Detailed debugging information
- **INFO** - General application flow
- **WARN** - Warning conditions
- **ERROR** - Error conditions requiring attention

### Structured Logging

```typescript
import { Logger } from './lib/logging/logger';

const logger = Logger.getInstance();

logger.info('User action performed', {
  action: 'node_create',
  nodeType: 'box',
  userId: 'user123',
});

logger.error('Operation failed', {
  operation: 'geometry_computation',
  error: error.message,
  context: { nodeId: 'node_456' },
});
```

### Log Sanitization

The system automatically removes sensitive information:

- Passwords and tokens
- API keys
- Personal identifiers (configurable)

## React Hooks

### useMonitoring

```typescript
import { useMonitoring } from './hooks/useMonitoring';

const {
  recordUserInteraction,
  executeMonitoredOperation,
  executeWasmOperation,
  executeNetworkOperation,
} = useMonitoring();

// Record user interactions
recordUserInteraction({
  type: 'button_click',
  target: 'create_node',
});

// Execute monitored operations
const result = await executeWasmOperation(
  () => performGeometryComputation(),
  'geometry_computation'
);
```

### useHealthMonitoring

```typescript
import { useHealthMonitoring } from './hooks/useMonitoring';

const { alerts, systemHealth, dismissAlert } = useHealthMonitoring();

// Display system health
console.log(`Memory: ${systemHealth.memoryUsage}MB`);
console.log(`Error Rate: ${systemHealth.errorRate}%`);
```

### useErrorMonitoring

```typescript
import { useErrorMonitoring } from './hooks/useMonitoring';

const { errors, criticalErrors, resolveError } = useErrorMonitoring();

// Handle errors in UI
errors.forEach((error) => {
  if (error.recoverable) {
    // Show recovery options
  }
});
```

## Configuration

### Environment Configurations

Pre-configured setups for different environments:

```typescript
import { getMonitoringConfig } from './config/monitoring';

// Development - Full monitoring, console logging
const devConfig = getMonitoringConfig('development');

// Production - Sampled monitoring, remote logging
const prodConfig = getMonitoringConfig('production');

// Test - Minimal monitoring
const testConfig = getMonitoringConfig('test');
```

### Service Integrations

Easy integration with popular monitoring services:

```typescript
import { configureSentry, configureDataDog, configureLogRocket } from './config/monitoring';

// Sentry error tracking
const sentryConfig = configureSentry(process.env.SENTRY_DSN);

// DataDog monitoring
const datadogConfig = configureDataDog(process.env.DATADOG_API_KEY);

// LogRocket session recording
const logrocketConfig = configureLogRocket(process.env.LOGROCKET_APP_ID);
```

## Monitoring Dashboard

Access the real-time monitoring dashboard:

- **Keyboard Shortcut**: `Ctrl+Shift+M`
- **Click**: Monitor button in the bottom-right corner

Dashboard features:

- System health overview
- Active alerts and errors
- Performance metrics
- Real-time log viewing

## Production Setup

### Environment Variables

```bash
# Error reporting
VITE_ERROR_REPORTING_ENDPOINT=https://api.sentry.io/...
VITE_ERROR_REPORTING_API_KEY=your-api-key

# Performance monitoring
VITE_PERFORMANCE_ENDPOINT=https://your-apm-service.com/...

# Analytics
VITE_ANALYTICS_ENDPOINT=https://your-analytics-service.com/...

# Build version for error context
VITE_BUILD_VERSION=1.0.0
```

### Server Headers

For optimal WASM performance, ensure your server sends:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Health Endpoints

The monitoring system can expose health check endpoints:

```typescript
// Example health endpoint
app.get('/health', (req, res) => {
  const monitoringSystem = MonitoringSystem.getInstance();
  const report = monitoringSystem.createMonitoringReport();

  res.json({
    status: report.dashboard.activeAlerts.length === 0 ? 'healthy' : 'degraded',
    timestamp: report.timestamp,
    version: report.buildVersion,
    alerts: report.dashboard.activeAlerts.length,
  });
});
```

## Performance Considerations

### Memory Usage

The monitoring system is designed to be lightweight:

- Configurable sampling rates to reduce overhead
- Automatic cleanup of old data
- Memory-conscious buffering

### Network Impact

- Batched network requests to reduce overhead
- Configurable sample rates for production
- Compression of monitoring data

### CPU Impact

- Minimal performance overhead (< 1% CPU)
- Asynchronous processing where possible
- Efficient data structures for metrics

## Debugging

### Common Issues

1. **Monitoring system not initialized**
   - Ensure `initializeMonitoring()` is called before using hooks
   - Check console for initialization errors

2. **Metrics not collected**
   - Verify metrics collector configuration
   - Check sampling rates in production

3. **Errors not reported**
   - Verify error reporting endpoint configuration
   - Check network connectivity and CORS settings

### Debug Mode

Enable debug logging:

```typescript
await initializeMonitoring('development', {
  monitoring: {
    logging: {
      level: 'debug',
      console: true,
      structured: true,
    },
  },
});
```

## Security Considerations

### Data Privacy

- Automatic sanitization of sensitive data
- Configurable anonymization for user analytics
- No storage of personally identifiable information

### Network Security

- HTTPS-only endpoints for data transmission
- API key-based authentication
- Request validation and rate limiting

## Contributing

When adding new monitoring features:

1. Add error codes to `types.ts`
2. Update error messages in `error-manager.ts`
3. Add metrics to relevant operations
4. Update documentation
5. Add tests for new functionality

## License

This monitoring system is part of Sim4D Studio and follows the same license terms.
