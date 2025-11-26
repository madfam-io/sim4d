import { Page } from '@playwright/test';

export interface MockPluginMarketplaceConfig {
  plugins: MockPlugin[];
  latencyMs: number;
  errorRate: number;
}

export interface MockPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  verified: boolean;
  price: number;
  bundle: MockPluginBundle;
  manifest: MockPluginManifest;
}

export interface MockPluginBundle {
  size: number;
  checksums: Record<string, string>;
  dependencies: string[];
  assets: string[];
}

export interface MockPluginManifest {
  nodes: string[];
  commands: string[];
  panels: string[];
  permissions: string[];
  engines: { sim4d: string };
  signature?: string;
}

export interface MockCloudServicesConfig {
  collaborationEnabled: boolean;
  syncLatencyMs: number;
  userSessions: MockUserSession[];
}

export interface MockUserSession {
  userId: string;
  displayName: string;
  avatar: string;
  permissions: string[];
  pluginQuota: number;
}

/**
 * Mock services for plugin testing that simulate real marketplace and cloud services
 * Provides controlled testing environment with configurable latency, errors, and responses
 */
export class MockPluginServices {
  private marketplace: MockPluginMarketplace;
  private cloudServices: MockCloudServices;
  private pluginSandbox: MockPluginSandbox;

  constructor(private page: Page) {
    this.marketplace = new MockPluginMarketplace();
    this.cloudServices = new MockCloudServices();
    this.pluginSandbox = new MockPluginSandbox();
  }

  /**
   * Initialize all mock services in the browser context
   */
  async initialize(
    config: {
      marketplace?: MockPluginMarketplaceConfig;
      cloudServices?: MockCloudServicesConfig;
    } = {}
  ): Promise<void> {
    // Inject mock services into browser context
    await this.page.addInitScript(
      (data) => {
        const { marketplaceConfig, cloudConfig } = data;

        // Mock Plugin Registry API
        (window as any).mockPluginRegistry = {
          async getPlugins(query?: string) {
            await new Promise((resolve) =>
              setTimeout(resolve, marketplaceConfig?.latencyMs || 100)
            );

            if (Math.random() < (marketplaceConfig?.errorRate || 0)) {
              throw new Error('Mock network error');
            }

            let plugins = marketplaceConfig?.plugins || [];
            if (query) {
              plugins = plugins.filter(
                (p) =>
                  p.name.toLowerCase().includes(query.toLowerCase()) ||
                  p.description.toLowerCase().includes(query.toLowerCase())
              );
            }
            return plugins;
          },

          async getPlugin(id: string) {
            await new Promise((resolve) =>
              setTimeout(resolve, marketplaceConfig?.latencyMs || 100)
            );
            return marketplaceConfig?.plugins?.find((p) => p.id === id) || null;
          },

          async downloadPlugin(id: string) {
            await new Promise((resolve) =>
              setTimeout(resolve, (marketplaceConfig?.latencyMs || 100) * 10)
            );

            const plugin = marketplaceConfig?.plugins?.find((p) => p.id === id);
            if (!plugin) throw new Error('Plugin not found');

            return {
              id: plugin.id,
              bundle: new Uint8Array(plugin.bundle.size),
              manifest: plugin.manifest,
              signature: plugin.manifest.signature,
            };
          },
        };

        // Mock Collaboration API
        (window as any).mockCollaboration = {
          async createSession(userIds: string[]) {
            await new Promise((resolve) => setTimeout(resolve, cloudConfig?.syncLatencyMs || 50));

            return {
              sessionId: `session_${Date.now()}`,
              users: userIds
                .map((id) => cloudConfig?.userSessions?.find((u) => u.userId === id))
                .filter(Boolean),
              state: new Map(),
            };
          },

          async syncPluginState(sessionId: string, pluginId: string, state: any) {
            await new Promise((resolve) => setTimeout(resolve, cloudConfig?.syncLatencyMs || 50));

            // Simulate state synchronization across users
            const event = new CustomEvent('plugin-state-sync', {
              detail: { sessionId, pluginId, state },
            });
            window.dispatchEvent(event);
          },

          async getUserSession(userId: string) {
            return cloudConfig?.userSessions?.find((u) => u.userId === userId) || null;
          },
        };

        // Mock Plugin Sandbox API
        (window as any).mockPluginSandbox = {
          async createSandbox(pluginId: string, config: any) {
            return {
              workerId: `worker_${pluginId}_${Date.now()}`,
              memoryLimit: config.memoryLimit || 64 * 1024 * 1024,
              timeoutMs: config.timeoutMs || 30000,
              isolated: true,
            };
          },

          async executeSandboxed(workerId: string, code: string, args: any[]) {
            // Simulate sandboxed execution
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Simple evaluation (in real implementation would use Web Workers)
            try {
              const fn = new Function('args', code);
              return { success: true, result: fn(args) };
            } catch (error) {
              return { success: false, error: error.message };
            }
          },

          async destroySandbox(workerId: string) {
            // Simulate cleanup
            await new Promise((resolve) => setTimeout(resolve, 10));
            return true;
          },
        };

        // Mock signature verification
        (window as any).mockCrypto = {
          async verifyEd25519Signature(data: Uint8Array, signature: string, publicKey: string) {
            // Simulate signature verification (always pass for testing)
            await new Promise((resolve) => setTimeout(resolve, 50));
            return signature === 'valid_signature';
          },
        };
      },
      {
        marketplaceConfig: config.marketplace,
        cloudConfig: config.cloudServices,
      }
    );

    // Initialize marketplace mock
    await this.marketplace.setup(this.page, config.marketplace);

    // Initialize cloud services mock
    await this.cloudServices.setup(this.page, config.cloudServices);

    // Initialize sandbox mock
    await this.pluginSandbox.setup(this.page);
  }

  /**
   * Configure marketplace with test plugins
   */
  async setupTestMarketplace(plugins: MockPlugin[]): Promise<void> {
    await this.marketplace.loadPlugins(plugins);
  }

  /**
   * Configure collaboration test users
   */
  async setupCollaborationUsers(users: MockUserSession[]): Promise<void> {
    await this.cloudServices.addUsers(users);
  }

  /**
   * Simulate network conditions
   */
  async simulateNetworkConditions(config: {
    latency?: number;
    bandwidth?: number;
    errorRate?: number;
  }): Promise<void> {
    await this.page.evaluate((networkConfig) => {
      (window as any).mockNetworkConditions = networkConfig;
    }, config);
  }

  /**
   * Get mock service statistics
   */
  async getStatistics(): Promise<{
    marketplaceRequests: number;
    collaborationEvents: number;
    sandboxExecutions: number;
    errors: number;
  }> {
    return await this.page.evaluate(() => {
      const stats = (window as any).mockServiceStats || {
        marketplaceRequests: 0,
        collaborationEvents: 0,
        sandboxExecutions: 0,
        errors: 0,
      };
      return stats;
    });
  }

  /**
   * Reset all mock services
   */
  async reset(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).mockServiceStats = {
        marketplaceRequests: 0,
        collaborationEvents: 0,
        sandboxExecutions: 0,
        errors: 0,
      };
    });
  }
}

/**
 * Mock Plugin Marketplace
 */
class MockPluginMarketplace {
  private plugins: MockPlugin[] = [];

  async setup(page: Page, config?: MockPluginMarketplaceConfig): Promise<void> {
    if (config?.plugins) {
      this.plugins = config.plugins;
    } else {
      // Default test plugins
      this.plugins = this.createDefaultPlugins();
    }

    // Inject marketplace DOM elements
    await page.evaluate((plugins) => {
      // Create marketplace container if it doesn't exist
      if (!document.querySelector('[data-testid="plugin-marketplace"]')) {
        const marketplace = document.createElement('div');
        marketplace.setAttribute('data-testid', 'plugin-marketplace');
        marketplace.style.display = 'none'; // Hidden by default
        document.body.appendChild(marketplace);

        // Add marketplace ready indicator
        const readyIndicator = document.createElement('div');
        readyIndicator.setAttribute('data-testid', 'marketplace-ready');
        marketplace.appendChild(readyIndicator);

        // Add search input
        const searchInput = document.createElement('input');
        searchInput.setAttribute('data-testid', 'marketplace-search');
        searchInput.placeholder = 'Search plugins...';
        marketplace.appendChild(searchInput);

        // Add plugin grid
        const pluginGrid = document.createElement('div');
        pluginGrid.setAttribute('data-testid', 'plugin-grid');
        marketplace.appendChild(pluginGrid);

        // Populate with plugin cards
        plugins.forEach((plugin: any) => {
          const card = document.createElement('div');
          card.setAttribute('data-testid', 'plugin-card');
          card.setAttribute('data-plugin-id', plugin.id);
          card.innerHTML = `
            <div data-testid="plugin-name">${plugin.name}</div>
            <div data-testid="plugin-version">${plugin.version}</div>
            <div data-testid="plugin-author">${plugin.author}</div>
            <div data-testid="plugin-description">${plugin.description}</div>
            <div data-testid="plugin-rating">${plugin.rating}</div>
            <button data-testid="install-plugin-${plugin.id}">Install</button>
          `;
          pluginGrid.appendChild(card);
        });
      }
    }, this.plugins);
  }

  async loadPlugins(plugins: MockPlugin[]): Promise<void> {
    this.plugins = plugins;
  }

  private createDefaultPlugins(): MockPlugin[] {
    return [
      {
        id: 'geometry-tools-plus',
        name: 'Geometry Tools Plus',
        version: '2.1.0',
        author: 'CAD Solutions Inc.',
        description:
          'Advanced geometry operations including complex boolean operations and surface analysis',
        category: 'Geometry',
        rating: 4.8,
        downloads: 15420,
        verified: true,
        price: 29.99,
        bundle: {
          size: 2.5 * 1024 * 1024, // 2.5MB
          checksums: { sha256: 'abc123' },
          dependencies: [],
          assets: ['icons/', 'shaders/', 'documentation/'],
        },
        manifest: {
          nodes: ['GeometryPlus::AdvancedBoolean', 'GeometryPlus::SurfaceAnalysis'],
          commands: ['analyzeSurface', 'optimizeMesh'],
          panels: ['GeometryAnalyzer'],
          permissions: ['read:graph', 'write:graph', 'worker:spawn'],
          engines: { sim4d: '>=0.1.0' },
          signature: 'valid_signature',
        },
      },
      {
        id: 'collaboration-sync',
        name: 'Real-time Collaboration',
        version: '1.0.3',
        author: 'TeamWork Systems',
        description:
          'Enable real-time collaboration with live parameter synchronization and conflict resolution',
        category: 'Collaboration',
        rating: 4.2,
        downloads: 8934,
        verified: true,
        price: 0, // Free
        bundle: {
          size: 1.2 * 1024 * 1024, // 1.2MB
          checksums: { sha256: 'def456' },
          dependencies: ['socket.io'],
          assets: ['ui/', 'translations/'],
        },
        manifest: {
          nodes: [],
          commands: ['startCollab', 'inviteUser', 'resolveConflict'],
          panels: ['CollaborationPanel'],
          permissions: ['network:websocket', 'ui:notification', 'ui:panel'],
          engines: { sim4d: '>=0.1.0' },
          signature: 'valid_signature',
        },
      },
      {
        id: 'parametric-optimizer',
        name: 'Design Optimizer',
        version: '3.0.1',
        author: 'OptimalCAD',
        description: 'AI-powered design optimization with genetic algorithms and machine learning',
        category: 'Optimization',
        rating: 4.9,
        downloads: 5247,
        verified: true,
        price: 99.99,
        bundle: {
          size: 8.7 * 1024 * 1024, // 8.7MB
          checksums: { sha256: 'ghi789' },
          dependencies: ['tensorflow.js'],
          assets: ['models/', 'algorithms/', 'examples/'],
        },
        manifest: {
          nodes: ['Optimizer::GeneticAlgorithm', 'Optimizer::MLPredict'],
          commands: ['optimize', 'trainModel', 'suggestParameters'],
          panels: ['OptimizerDashboard'],
          permissions: [
            'read:graph',
            'write:graph',
            'network:fetch',
            'worker:spawn',
            'wasm:execute',
          ],
          engines: { sim4d: '>=0.1.0' },
          signature: 'valid_signature',
        },
      },
      {
        id: 'test-malicious-plugin',
        name: 'Suspicious Plugin',
        version: '1.0.0',
        author: 'Unknown Author',
        description: 'A plugin with suspicious permissions for security testing',
        category: 'Testing',
        rating: 1.2,
        downloads: 12,
        verified: false,
        price: 0,
        bundle: {
          size: 0.1 * 1024 * 1024, // 0.1MB
          checksums: { sha256: 'suspicious' },
          dependencies: [],
          assets: [],
        },
        manifest: {
          nodes: ['Malicious::DataExfiltrator'],
          commands: ['stealData', 'sendHome'],
          panels: [],
          permissions: ['read:files', 'write:files', 'network:fetch', 'system:info', 'native:code'],
          engines: { sim4d: '>=0.1.0' },
          signature: 'invalid_signature',
        },
      },
    ];
  }
}

/**
 * Mock Cloud Services
 */
class MockCloudServices {
  private users: MockUserSession[] = [];

  async setup(page: Page, config?: MockCloudServicesConfig): Promise<void> {
    if (config?.userSessions) {
      this.users = config.userSessions;
    } else {
      this.users = this.createDefaultUsers();
    }

    // Inject collaboration UI elements
    await page.evaluate((users) => {
      // Create collaboration panel
      if (!document.querySelector('[data-testid="collaboration-panel"]')) {
        const panel = document.createElement('div');
        panel.setAttribute('data-testid', 'collaboration-panel');
        panel.style.display = 'none';
        document.body.appendChild(panel);

        // Add user list
        const userList = document.createElement('div');
        userList.setAttribute('data-testid', 'collaboration-users');
        panel.appendChild(userList);

        users.forEach((user: any) => {
          const userItem = document.createElement('div');
          userItem.setAttribute('data-testid', `user-${user.userId}`);
          userItem.innerHTML = `
            <span>${user.displayName}</span>
            <img src="${user.avatar}" alt="${user.displayName}" />
          `;
          userList.appendChild(userItem);
        });
      }
    }, this.users);
  }

  async addUsers(users: MockUserSession[]): Promise<void> {
    this.users = [...this.users, ...users];
  }

  private createDefaultUsers(): MockUserSession[] {
    return [
      {
        userId: 'user1',
        displayName: 'Alice Designer',
        avatar: '/avatars/alice.png',
        permissions: ['install_plugins', 'create_sessions'],
        pluginQuota: 100,
      },
      {
        userId: 'user2',
        displayName: 'Bob Engineer',
        avatar: '/avatars/bob.png',
        permissions: ['install_plugins', 'join_sessions'],
        pluginQuota: 50,
      },
      {
        userId: 'user3',
        displayName: 'Carol Manager',
        avatar: '/avatars/carol.png',
        permissions: ['install_plugins', 'create_sessions', 'admin'],
        pluginQuota: 200,
      },
    ];
  }
}

/**
 * Mock Plugin Sandbox
 */
class MockPluginSandbox {
  async setup(page: Page): Promise<void> {
    // Inject sandbox monitoring UI
    await page.evaluate(() => {
      if (!document.querySelector('[data-testid="sandbox-monitor"]')) {
        const monitor = document.createElement('div');
        monitor.setAttribute('data-testid', 'sandbox-monitor');
        monitor.style.display = 'none';
        document.body.appendChild(monitor);

        // Add sandbox status indicators
        const statusIndicators = document.createElement('div');
        statusIndicators.innerHTML = `
          <div data-testid="sandbox-memory-usage">Memory: 0MB</div>
          <div data-testid="sandbox-execution-time">Execution: 0ms</div>
          <div data-testid="sandbox-network-requests">Network: 0</div>
          <div data-testid="sandbox-isolated" data-isolated="true">Isolated: Yes</div>
        `;
        monitor.appendChild(statusIndicators);
      }
    });
  }
}

// Export predefined test configurations
export const TEST_PLUGIN_CONFIGS = {
  BASIC_MARKETPLACE: {
    plugins: [
      // Basic geometry plugin for fundamental testing
      {
        id: 'basic-geometry',
        name: 'Basic Geometry',
        version: '1.0.0',
        author: 'Sim4D Team',
        description: 'Basic geometry operations',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1000,
        verified: true,
        price: 0,
        bundle: { size: 512 * 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box', 'Basic::Sphere'],
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { sim4d: '>=0.1.0' },
        },
      },
    ],
    latencyMs: 100,
    errorRate: 0.05,
  },

  COLLABORATION_TEST: {
    collaborationEnabled: true,
    syncLatencyMs: 50,
    userSessions: [
      {
        userId: 'test_user_1',
        displayName: 'Test User 1',
        avatar: '/test-avatar-1.png',
        permissions: ['install_plugins'],
        pluginQuota: 10,
      },
      {
        userId: 'test_user_2',
        displayName: 'Test User 2',
        avatar: '/test-avatar-2.png',
        permissions: ['install_plugins'],
        pluginQuota: 10,
      },
    ],
  },

  SECURITY_TEST: {
    plugins: [
      // Plugin with excessive permissions for security testing
      {
        id: 'security-test-plugin',
        name: 'Security Test Plugin',
        version: '1.0.0',
        author: 'Security Team',
        description: 'Plugin for testing security features',
        category: 'Testing',
        rating: 5.0,
        downloads: 1,
        verified: false,
        price: 0,
        bundle: { size: 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: [],
          commands: ['testSecurity'],
          panels: [],
          permissions: ['read:files', 'write:files', 'network:fetch', 'native:code'],
          engines: { sim4d: '>=0.1.0' },
          signature: 'invalid_signature',
        },
      },
    ],
    latencyMs: 10,
    errorRate: 0,
  },
};
