# Sim4D Plugin Testing Infrastructure

This directory contains comprehensive browser-based testing infrastructure for Sim4D's plugin ecosystem. The testing framework validates plugin installation, security sandboxing, marketplace workflows, multi-user collaboration, and core system integration.

## Overview

The plugin testing infrastructure provides:

- **Plugin Lifecycle Testing**: Installation, activation, deactivation, uninstallation
- **Security Validation**: Sandbox isolation, permission enforcement, signature verification
- **Marketplace Simulation**: Plugin discovery, installation flows, rating systems
- **Multi-User Collaboration**: Real-time state synchronization, conflict resolution
- **Integration Testing**: Node editor, viewport, inspector panel integration
- **Performance Monitoring**: Resource usage, memory management, execution metrics

## Test Structure

```
tests/e2e/plugins/
├── plugin-test-helper.ts         # Core testing utilities and helpers
├── mock-services.ts              # Mock marketplace and cloud services
├── plugin-lifecycle.test.ts      # Plugin installation and management
├── plugin-security.test.ts       # Security sandboxing and permissions
├── plugin-collaboration.test.ts  # Multi-user collaboration features
├── plugin-integration.test.ts    # Core system integration
├── plugin-test-patterns.ts       # Reusable test patterns
└── README.md                     # This documentation
```

## Key Components

### PluginTestHelper

The main testing utility class that provides:

- Plugin marketplace browsing and installation
- Security sandbox validation
- Multi-user collaboration simulation
- Integration with existing node, viewport, and inspector helpers
- Plugin execution and resource monitoring

### MockPluginServices

Simulated services for reliable testing:

- **MockPluginMarketplace**: Simulated plugin registry with configurable plugins
- **MockCloudServices**: Collaboration service simulation with user sessions
- **MockPluginSandbox**: Sandbox environment simulation for security testing

### Test Patterns

Reusable test patterns for common plugin scenarios:

- Basic node plugin testing
- Parameter validation
- Node connection testing
- Performance benchmarking
- Memory management
- Error handling
- Security boundary testing
- Collaboration workflows

## Usage Examples

### Basic Plugin Testing

```typescript
import { test, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';
import { MockPluginServices, TEST_PLUGIN_CONFIGS } from './mock-services';

test('should install and use geometry plugin', async ({ page }) => {
  const pluginHelper = new PluginTestHelper(page);
  const mockServices = new MockPluginServices(page);

  // Initialize mock services
  await mockServices.initialize({
    marketplace: TEST_PLUGIN_CONFIGS.BASIC_MARKETPLACE,
  });

  // Install plugin
  const context = await pluginHelper.installPlugin('basic-geometry');

  // Test node integration
  const result = await pluginHelper.testPluginNodeIntegration('basic-geometry', 'Basic::Box');

  expect(result.nodeCreated).toBe(true);
  expect(result.evaluationSuccessful).toBe(true);
});
```

### Security Testing

```typescript
test('should enforce sandbox isolation', async ({ page }) => {
  const pluginHelper = new PluginTestHelper(page);

  await pluginHelper.installPlugin('security-test-plugin', { allowUnsigned: true });

  const isolation = await pluginHelper.validateSandboxIsolation('security-test-plugin');

  expect(isolation.memoryIsolated).toBe(true);
  expect(isolation.networkRestricted).toBe(true);
  expect(isolation.storageIsolated).toBe(true);
});
```

### Collaboration Testing

```typescript
test('should synchronize plugin states across users', async ({ page }) => {
  const pluginHelper = new PluginTestHelper(page);

  const session = await pluginHelper.testMultiUserPluginCollaboration({
    users: ['user1', 'user2'],
    pluginId: 'basic-geometry',
    workflowActions: [
      { user: 'user1', action: 'createNode', data: { type: 'Basic::Box' } },
      { user: 'user2', action: 'editParameter', data: { param: 'width', value: 150 } },
    ],
  });

  const syncResult = await pluginHelper.validatePluginStateSynchronization(
    session.sessionId,
    'basic-geometry'
  );

  expect(syncResult.synchronized).toBe(true);
});
```

### Using Test Patterns

```typescript
import { PluginTestPatterns } from './plugin-test-patterns';

test('should pass geometry node test pattern', async ({ page }) => {
  const patterns = new PluginTestPatterns(page);

  await patterns.testBasicNodePlugin('basic-geometry', 'Basic::Box', {
    width: 100,
    height: 50,
    depth: 25,
  });
});
```

## Configuration

### Mock Plugin Configuration

The testing infrastructure includes predefined plugin configurations:

- **BASIC_MARKETPLACE**: Simple plugins for fundamental testing
- **COLLABORATION_TEST**: Multi-user collaboration scenarios
- **SECURITY_TEST**: Security-focused plugins with various permission levels

### Test Environment Setup

Tests require:

1. Sim4D Studio running on `http://localhost:5173`
2. Mock services initialized before each test
3. Proper browser configuration for WebGL and WASM support

## Integration with Existing Helpers

The plugin testing infrastructure integrates with existing Sim4D test helpers:

- **NodeTestHelper**: Node creation, parameter editing, graph evaluation
- **ViewportTestHelper**: 3D viewport interaction, rendering validation
- **InspectorTestHelper**: Parameter panel testing, performance monitoring

## Performance Considerations

### Test Optimization

- Mock services provide configurable latency and error rates
- Parallel execution supported for independent plugin operations
- Resource cleanup after each test to prevent memory leaks

### Browser Configuration

Extended Playwright configuration includes:

```typescript
launchOptions: {
  args: [
    '--enable-webgl',
    '--enable-shared-array-buffer',
    '--disable-web-security', // For plugin sandbox testing
    '--enable-features=SharedArrayBuffer',
  ];
}
```

## Security Testing

### Sandbox Validation

Tests verify:

- Memory isolation between plugins and main application
- Network access restrictions based on allowlists
- Storage isolation with plugin-specific namespaces
- Web Worker isolation for plugin execution

### Permission Enforcement

Validates that plugins cannot:

- Access unauthorized APIs or data
- Modify other plugins or main application
- Persist data outside designated storage areas
- Execute code outside sandbox boundaries

## Collaboration Testing

### Multi-User Scenarios

Tests cover:

- Real-time state synchronization across users
- Conflict resolution for concurrent parameter edits
- Permission-based access control per user
- Performance under multi-user load

### State Management

Validates:

- Consistent plugin state across user sessions
- Proper conflict detection and resolution
- Minimal synchronization latency
- Resource sharing between users

## Best Practices

### Plugin Developer Guidelines

1. **Use Test Patterns**: Leverage predefined patterns for common scenarios
2. **Mock Dependencies**: Use mock services for reliable, isolated testing
3. **Validate Security**: Always test permission boundaries and sandbox isolation
4. **Test Collaboration**: Verify plugin behavior in multi-user environments
5. **Monitor Performance**: Include performance benchmarks and resource monitoring

### Test Organization

1. **Separate Concerns**: Distinct test files for lifecycle, security, collaboration, integration
2. **Reusable Utilities**: Extract common functionality into helper methods
3. **Configurable Mocks**: Use parameterized mock services for different scenarios
4. **Comprehensive Coverage**: Test both success and failure paths

## Troubleshooting

### Common Issues

1. **Plugin Installation Failures**: Check mock marketplace configuration
2. **Security Test Failures**: Verify sandbox isolation is properly implemented
3. **Collaboration Sync Issues**: Check mock cloud services latency settings
4. **Integration Test Failures**: Ensure proper helper initialization order

### Debug Tools

- Browser DevTools for plugin execution inspection
- Mock service statistics for network simulation analysis
- Performance metrics for resource usage monitoring
- Test helper logging for detailed execution traces

## Future Enhancements

### Planned Features

1. **Plugin Performance Profiling**: Advanced performance analysis tools
2. **Automated Security Scanning**: Static analysis integration for plugin code
3. **Load Testing**: High-volume plugin installation and usage testing
4. **Cross-Browser Compatibility**: Extended browser support validation
5. **Plugin Marketplace Integration**: Real marketplace API testing capabilities

### Extension Points

The testing infrastructure is designed for extensibility:

- Custom test patterns for domain-specific plugins
- Additional mock services for specialized testing scenarios
- Integration with CI/CD pipelines for automated plugin validation
- Performance benchmarking and regression detection
