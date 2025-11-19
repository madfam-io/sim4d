import { Page } from '@playwright/test';
import {
  Plugin,
  PluginId,
  PluginPermission,
  UserId,
} from '../../../packages/cloud-services/src/plugins/types';

/**
 * Mock Services for Plugin Testing
 * Provides controlled environments for testing plugin ecosystem features
 */

export interface MockPluginConfig {
  id: PluginId;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: PluginPermission[];
  nodeTypes: string[];
  hasSecurityIssues?: boolean;
  installLatency?: number;
  executionTime?: number;
  memoryUsage?: number;
}

export interface MockMarketplaceConfig {
  plugins: MockPluginConfig[];
  searchLatency?: number;
  installFailureRate?: number;
  networkCondition?: 'fast' | 'slow' | 'offline';
}

export interface MockCollaborationConfig {
  users: Array<{
    id: UserId;
    name: string;
    permissions: string[];
  }>;
  syncLatency?: number;
  conflictRate?: number;
}

export class MockServices {
  constructor(private page: Page) {}

  // === Plugin Marketplace Mocking ===

  async setupMockMarketplace(config: MockMarketplaceConfig): Promise<void> {
    await this.page.addInitScript((marketplaceConfig) => {
      // Mock the plugin marketplace service
      (window as any).mockMarketplace = {
        plugins: marketplaceConfig.plugins,
        config: marketplaceConfig,

        async searchPlugins(query: string) {
          const delay = marketplaceConfig.searchLatency || 100;
          await new Promise((resolve) => setTimeout(resolve, delay));

          return marketplaceConfig.plugins.filter(
            (plugin) =>
              plugin.name.toLowerCase().includes(query.toLowerCase()) ||
              plugin.description.toLowerCase().includes(query.toLowerCase())
          );
        },

        async getPlugin(id: string) {
          const delay = marketplaceConfig.searchLatency || 100;
          await new Promise((resolve) => setTimeout(resolve, delay));

          return marketplaceConfig.plugins.find((plugin) => plugin.id === id);
        },

        async installPlugin(id: string) {
          const plugin = marketplaceConfig.plugins.find((p) => p.id === id);
          if (!plugin) throw new Error(`Plugin ${id} not found`);

          const delay = plugin.installLatency || 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Simulate installation failure
          const failureRate = marketplaceConfig.installFailureRate || 0;
          if (Math.random() < failureRate) {
            throw new Error(`Installation failed for plugin ${id}`);
          }

          return {
            success: true,
            plugin: plugin,
          };
        },
      };

      // Override fetch for marketplace API calls
      const originalFetch = window.fetch;
      window.fetch = async function (url, options) {
        if (typeof url === 'string' && url.includes('/api/plugins')) {
          const mockMarketplace = (window as any).mockMarketplace;

          if (url.includes('/search')) {
            const urlObj = new URL(url, window.location.origin);
            const query = urlObj.searchParams.get('q') || '';
            const results = await mockMarketplace.searchPlugins(query);
            return new Response(JSON.stringify(results), {
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (url.includes('/install')) {
            const pluginId = url.split('/install/')[1];
            try {
              const result = await mockMarketplace.installPlugin(pluginId);
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' },
              });
            } catch (error) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }

          if (url.match(/\/plugins\/[^/]+$/)) {
            const pluginId = url.split('/plugins/')[1];
            const plugin = await mockMarketplace.getPlugin(pluginId);
            return new Response(JSON.stringify(plugin), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        return originalFetch.call(this, url, options);
      };
    }, config);
  }

  // === Cloud Services Mocking ===

  async setupMockCloudServices(config: MockCollaborationConfig): Promise<void> {
    await this.page.addInitScript((cloudConfig) => {
      (window as any).mockCloudServices = {
        users: cloudConfig.users,
        config: cloudConfig,
        sessions: new Map(),

        async createSession(userId: string) {
          const user = cloudConfig.users.find((u) => u.id === userId);
          if (!user) throw new Error(`User ${userId} not found`);

          // Use cryptographically secure random generation
          const randomBytes = crypto.getRandomValues(new Uint8Array(6));
          const randomStr = Array.from(randomBytes, (byte) => byte.toString(36)).join('');
          const sessionId = `session-${Date.now()}-${randomStr}`;
          this.sessions.set(sessionId, {
            id: sessionId,
            userId: userId,
            user: user,
            plugins: new Map(),
            createdAt: new Date(),
          });

          return sessionId;
        },

        async syncPluginState(sessionId: string, pluginId: string, state: any) {
          const delay = cloudConfig.syncLatency || 50;
          await new Promise((resolve) => setTimeout(resolve, delay));

          const session = this.sessions.get(sessionId);
          if (!session) throw new Error(`Session ${sessionId} not found`);

          session.plugins.set(pluginId, {
            state: state,
            lastUpdated: new Date(),
          });

          // Simulate sync conflicts
          const conflictRate = cloudConfig.conflictRate || 0;
          if (Math.random() < conflictRate) {
            throw new Error(`Sync conflict for plugin ${pluginId}`);
          }

          return { success: true, timestamp: new Date() };
        },

        getPluginState(sessionId: string, pluginId: string) {
          const session = this.sessions.get(sessionId);
          if (!session) return null;

          return session.plugins.get(pluginId);
        },
      };

      // Mock WebSocket connections for real-time collaboration
      const originalWebSocket = window.WebSocket;
      (window as any).MockWebSocket = class extends EventTarget {
        readyState = WebSocket.CONNECTING;
        url: string;

        constructor(url: string) {
          super();
          this.url = url;

          setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            this.dispatchEvent(new Event('open'));
          }, 100);
        }

        send(data: string) {
          // Simulate message handling
          const message = JSON.parse(data);
          const response = this.handleMessage(message);

          if (response) {
            setTimeout(() => {
              this.dispatchEvent(
                new MessageEvent('message', {
                  data: JSON.stringify(response),
                })
              );
            }, cloudConfig.syncLatency || 50);
          }
        }

        close() {
          this.readyState = WebSocket.CLOSED;
          this.dispatchEvent(new Event('close'));
        }

        private handleMessage(message: any) {
          const mockCloudServices = (window as any).mockCloudServices;

          switch (message.type) {
            case 'plugin_state_update':
              return {
                type: 'plugin_state_synced',
                pluginId: message.pluginId,
                timestamp: new Date().toISOString(),
              };

            case 'plugin_collaboration_event':
              return {
                type: 'collaboration_event_response',
                eventId: message.eventId,
                participants: mockCloudServices.users.length,
              };

            default:
              return null;
          }
        }
      };

      if (window.location.search.includes('mock=true')) {
        window.WebSocket = (window as any).MockWebSocket;
      }
    }, config);
  }

  // === Plugin Security Mocking ===

  async setupSecurityMocks(): Promise<void> {
    await this.page.addInitScript(() => {
      // Mock plugin security system
      (window as any).mockSecurity = {
        signatures: new Map(),
        permissions: new Map(),

        verifySignature(pluginId: string, signature: string): boolean {
          // Simulate signature verification
          const storedSignature = this.signatures.get(pluginId);
          return storedSignature === signature;
        },

        setSignature(pluginId: string, signature: string): void {
          this.signatures.set(pluginId, signature);
        },

        checkPermission(pluginId: string, permission: string): boolean {
          const pluginPermissions = this.permissions.get(pluginId) || [];
          return pluginPermissions.includes(permission);
        },

        setPermissions(pluginId: string, permissions: string[]): void {
          this.permissions.set(pluginId, permissions);
        },

        enforceSecurityBoundary(pluginId: string, action: string): boolean {
          // Simulate security boundary enforcement
          const dangerousActions = ['file_system_write', 'network_request', 'dom_manipulation'];

          if (dangerousActions.includes(action)) {
            return this.checkPermission(pluginId, action);
          }

          return true; // Allow safe actions
        },
      };

      // Mock Worker for plugin isolation testing
      const originalWorker = window.Worker;
      (window as any).MockWorker = class extends EventTarget {
        private pluginId: string;
        private isolated: boolean = true;

        constructor(scriptURL: string | URL, options?: WorkerOptions) {
          super();

          // Extract plugin ID from script URL
          const urlString = scriptURL.toString();
          const match = urlString.match(/plugin-([^/]+)/);
          this.pluginId = match ? match[1] : 'unknown';

          // Simulate worker initialization
          setTimeout(() => {
            this.dispatchEvent(
              new MessageEvent('message', {
                data: { type: 'worker_ready', pluginId: this.pluginId },
              })
            );
          }, 100);
        }

        postMessage(message: any): void {
          const mockSecurity = (window as any).mockSecurity;

          // Check if action is allowed
          if (message.type && message.type.startsWith('action_')) {
            const action = message.type.replace('action_', '');
            const allowed = mockSecurity.enforceSecurityBoundary(this.pluginId, action);

            if (!allowed) {
              this.dispatchEvent(
                new MessageEvent('error', {
                  data: { error: `Permission denied for action: ${action}` },
                })
              );
              return;
            }
          }

          // Simulate worker response
          setTimeout(() => {
            this.dispatchEvent(
              new MessageEvent('message', {
                data: {
                  type: 'action_response',
                  result: `Action completed: ${message.type}`,
                  pluginId: this.pluginId,
                },
              })
            );
          }, 50);
        }

        terminate(): void {
          this.dispatchEvent(new Event('terminate'));
        }

        isIsolated(): boolean {
          return this.isolated;
        }
      };
    });
  }

  // === Network Condition Simulation ===

  async setNetworkCondition(condition: 'fast' | 'slow' | 'offline'): Promise<void> {
    if (condition === 'offline') {
      await this.page.setOffline(true);
    } else {
      await this.page.setOffline(false);

      // Simulate different network speeds
      const conditions = {
        fast: { downloadThroughput: 1000000, uploadThroughput: 1000000, latency: 10 },
        slow: { downloadThroughput: 50000, uploadThroughput: 20000, latency: 500 },
      };

      if (condition !== 'fast') {
        await this.page.route('**/*', async (route) => {
          // Add artificial delay for slow connections
          if (condition === 'slow') {
            await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
          }
          await route.continue();
        });
      }
    }
  }

  // === Test Data Generation ===

  generateTestPlugin(overrides: Partial<MockPluginConfig> = {}): MockPluginConfig {
    const id = overrides.id || `test-plugin-${Date.now()}`;

    return {
      id,
      name: overrides.name || `Test Plugin ${id}`,
      version: overrides.version || '1.0.0',
      description: overrides.description || 'A test plugin for automated testing',
      author: overrides.author || 'Test Author',
      permissions: overrides.permissions || ['node_creation', 'parameter_access'],
      nodeTypes: overrides.nodeTypes || [`${id}::TestNode`],
      hasSecurityIssues: overrides.hasSecurityIssues || false,
      installLatency: overrides.installLatency || 1000,
      executionTime: overrides.executionTime || 100,
      memoryUsage: overrides.memoryUsage || 1024 * 1024, // 1MB
    };
  }

  generateTestMarketplace(pluginCount: number = 5): MockMarketplaceConfig {
    const plugins: MockPluginConfig[] = [];

    for (let i = 0; i < pluginCount; i++) {
      plugins.push(
        this.generateTestPlugin({
          id: `test-plugin-${i}`,
          name: `Test Plugin ${i}`,
          description: `Test plugin number ${i} for automated testing`,
        })
      );
    }

    return {
      plugins,
      searchLatency: 200,
      installFailureRate: 0.1, // 10% failure rate
      networkCondition: 'fast',
    };
  }

  generateTestUsers(userCount: number = 3): MockCollaborationConfig {
    const users = [];

    for (let i = 0; i < userCount; i++) {
      users.push({
        id: `test-user-${i}`,
        name: `Test User ${i}`,
        permissions: ['plugin_install', 'plugin_execute', 'collaboration'],
      });
    }

    return {
      users,
      syncLatency: 100,
      conflictRate: 0.05, // 5% conflict rate
    };
  }

  // === Cleanup ===

  async cleanup(): Promise<void> {
    await this.page.evaluate(() => {
      // Clean up all mock services
      delete (window as any).mockMarketplace;
      delete (window as any).mockCloudServices;
      delete (window as any).mockSecurity;
      delete (window as any).MockWebSocket;
      delete (window as any).MockWorker;
    });

    // Reset network conditions
    await this.page.setOffline(false);
    await this.page.unroute('**/*');
  }
}
