/**
 * Plugin Manager
 * Handles plugin installation, execution, and lifecycle management
 */

import EventEmitter from 'events';
import {
  PluginId,
  UserId,
  Plugin,
  PluginManifest,
  PluginPermissions,
  PluginBundle,
  SecurityScanResult,
  Ed25519Signature,
} from '@brepflow/cloud-api/src/types';

export interface PluginExecutionContext {
  pluginId: PluginId;
  userId: UserId;
  projectId?: string;
  nodeId?: string;
  sessionId?: string;
  capabilities: Map<string, PluginCapability>;
  sandbox: PluginSandbox;
}

export interface PluginCapability {
  name: string;
  version: string;
  permissions: string[];
  handler: (context: PluginExecutionContext, ...args: any[]) => any;
}

export interface PluginSandbox {
  workerId: string;
  memoryLimit: number;
  networkAllowlist: string[];
  storageQuota: number;
  timeoutMs: number;
  isolated: boolean;
}

export interface PluginInstallOptions {
  version?: string;
  source: 'marketplace' | 'local' | 'url';
  verify: boolean;
  permissions?: Partial<PluginPermissions>;
}

export interface PluginExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  logs: PluginLogEntry[];
  metrics: PluginMetrics;
}

export interface PluginLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PluginMetrics {
  executionTime: number;
  memoryUsed: number;
  networkRequests: number;
  storageUsed: number;
  errors: number;
}

export interface PluginBackup {
  timestamp: number;
  plugin: Plugin;
  storage: Record<string, string>;
}

export class PluginManager extends EventEmitter {
  private installedPlugins = new Map<PluginId, Plugin>();
  private runtimeSandboxes = new Map<PluginId, PluginSandbox>();
  private capabilities = new Map<string, PluginCapability>();
  private executionQueue: PluginExecutionTask[] = [];
  private isExecuting = false;

  constructor(private config: PluginManagerConfig) {
    super();
    this.initializeCapabilities();
  }

  /**
   * Install a plugin from marketplace or local source
   */
  async installPlugin(
    pluginId: PluginId,
    userId: UserId,
    options: PluginInstallOptions
  ): Promise<Plugin> {
    try {
      this.emit('plugin-install-started', { pluginId, userId, options });

      // 1. Fetch plugin metadata and bundle
      const plugin = await this.fetchPlugin(pluginId, options);

      // 2. Verify plugin signature and security
      if (options.verify) {
        await this.verifyPlugin(plugin);
      }

      // 3. Check permissions and compatibility
      await this.validatePlugin(plugin, userId);

      // 4. Create sandbox environment
      const sandbox = await this.createSandbox(plugin);

      // 5. Install plugin bundle
      await this.installPluginBundle(plugin, sandbox);

      // 6. Register plugin and capabilities
      this.installedPlugins.set(pluginId, plugin);
      this.runtimeSandboxes.set(pluginId, sandbox);

      // 7. Initialize plugin
      await this.initializePlugin(plugin, sandbox);

      this.emit('plugin-installed', { plugin, userId });

      return plugin;
    } catch (error) {
      this.emit('plugin-install-error', { pluginId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: PluginId, userId: UserId): Promise<void> {
    try {
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} is not installed`);
      }

      this.emit('plugin-uninstall-started', { pluginId, userId });

      // 1. Stop any running executions
      await this.stopPluginExecutions(pluginId);

      // 2. Clean up sandbox
      const sandbox = this.runtimeSandboxes.get(pluginId);
      if (sandbox) {
        await this.destroySandbox(sandbox);
        this.runtimeSandboxes.delete(pluginId);
      }

      // 3. Remove plugin from registry
      this.installedPlugins.delete(pluginId);

      // 4. Clean up storage and resources
      await this.cleanupPluginResources(plugin);

      this.emit('plugin-uninstalled', { pluginId, userId });
    } catch (error) {
      this.emit('plugin-uninstall-error', { pluginId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Execute a plugin function
   */
  async executePlugin(
    pluginId: PluginId,
    functionName: string,
    args: any[],
    context: Partial<PluginExecutionContext>
  ): Promise<PluginExecutionResult> {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    const sandbox = this.runtimeSandboxes.get(pluginId);
    if (!sandbox) {
      throw new Error(`Plugin ${pluginId} sandbox not available`);
    }

    const executionContext: PluginExecutionContext = {
      pluginId,
      userId: context.userId!,
      projectId: context.projectId,
      nodeId: context.nodeId,
      sessionId: context.sessionId,
      capabilities: this.capabilities,
      sandbox,
    };

    const task: PluginExecutionTask = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pluginId,
      functionName,
      args,
      context: executionContext,
      createdAt: Date.now(),
    };

    this.executionQueue.push(task);

    if (!this.isExecuting) {
      this.processExecutionQueue();
    }

    return new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;
    });
  }

  /**
   * Get list of installed plugins
   */
  getInstalledPlugins(userId: UserId): Plugin[] {
    // Filter plugins by user ownership and permissions
    return Array.from(this.installedPlugins.values()).filter((plugin) => {
      // In production, would check plugin.metadata.installedBy === userId
      // and user's permission to access plugin
      // For now, return all plugins (future enhancement: add user-plugin relationship tracking)
      return true;
    });
  }

  /**
   * Get plugin details
   */
  getPlugin(pluginId: PluginId): Plugin | null {
    return this.installedPlugins.get(pluginId) || null;
  }

  /**
   * Check if plugin has specific capability
   */
  hasCapability(pluginId: PluginId, capabilityName: string): boolean {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin) return false;

    return this.capabilities.has(capabilityName);
  }

  /**
   * Update plugin to new version
   */
  async updatePlugin(pluginId: PluginId, newVersion: string, userId: UserId): Promise<Plugin> {
    try {
      this.emit('plugin-update-started', { pluginId, newVersion, userId });

      // 1. Fetch new version
      const newPlugin = await this.fetchPlugin(pluginId, {
        version: newVersion,
        source: 'marketplace',
        verify: true,
      });

      // 2. Verify compatibility
      await this.validatePluginUpdate(pluginId, newPlugin);

      // 3. Backup current plugin state
      const backup = await this.backupPlugin(pluginId);

      try {
        // 4. Uninstall current version
        await this.uninstallPlugin(pluginId, userId);

        // 5. Install new version
        const updatedPlugin = await this.installPlugin(pluginId, userId, {
          version: newVersion,
          source: 'marketplace',
          verify: true,
        });

        this.emit('plugin-updated', { pluginId, newVersion, userId });

        return updatedPlugin;
      } catch (error) {
        // Rollback on failure
        await this.restorePlugin(backup);
        throw error;
      }
    } catch (error) {
      this.emit('plugin-update-error', { pluginId, newVersion, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Enable/disable plugin
   */
  async togglePlugin(pluginId: PluginId, enabled: boolean, userId: UserId): Promise<void> {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (enabled) {
      await this.enablePlugin(plugin);
    } else {
      await this.disablePlugin(plugin);
    }

    this.emit('plugin-toggled', { pluginId, enabled, userId });
  }

  // Private methods

  private async processExecutionQueue(): Promise<void> {
    if (this.isExecuting || this.executionQueue.length === 0) {
      return;
    }

    this.isExecuting = true;

    while (this.executionQueue.length > 0) {
      const task = this.executionQueue.shift()!;

      try {
        const result = await this.executePluginTask(task);
        task.resolve!(result);
      } catch (error) {
        task.reject!(error);
      }
    }

    this.isExecuting = false;
  }

  private async executePluginTask(task: PluginExecutionTask): Promise<PluginExecutionResult> {
    const startTime = Date.now();
    const logs: PluginLogEntry[] = [];
    let memoryUsed = 0;
    let networkRequests = 0;
    let errors = 0;

    try {
      this.emit('plugin-execution-started', { task });

      // Create execution context in sandbox
      const result = await this.executeSandboxed(task);

      const executionTime = Date.now() - startTime;

      // Track storage used by plugin (estimate from sandbox)
      const storageUsed = await this.getPluginStorageUsage(task.pluginId);

      const metrics: PluginMetrics = {
        executionTime,
        memoryUsed,
        networkRequests,
        storageUsed,
        errors,
      };

      this.emit('plugin-execution-completed', { task, result, metrics });

      return {
        success: true,
        result,
        logs,
        metrics,
      };
    } catch (error) {
      errors++;
      const executionTime = Date.now() - startTime;

      logs.push({
        level: 'error',
        message: error.message,
        timestamp: new Date(),
        metadata: { stack: error.stack },
      });

      const metrics: PluginMetrics = {
        executionTime,
        memoryUsed,
        networkRequests,
        storageUsed: 0,
        errors,
      };

      this.emit('plugin-execution-error', { task, error: error.message, metrics });

      return {
        success: false,
        error: error.message,
        logs,
        metrics,
      };
    }
  }

  private async executeSandboxed(task: PluginExecutionTask): Promise<any> {
    const { sandbox } = task.context;

    // Create isolated worker for plugin execution
    const worker = new Worker('/plugin-sandbox-worker.js', {
      type: 'module',
      credentials: 'omit',
    });

    try {
      // Set up communication with worker
      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Plugin execution timeout'));
        }, sandbox.timeoutMs);

        worker.onmessage = (event) => {
          clearTimeout(timeout);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        };

        worker.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        // Send execution request to worker
        worker.postMessage({
          type: 'execute',
          pluginId: task.pluginId,
          functionName: task.functionName,
          args: task.args,
          context: task.context,
        });
      });

      return result;
    } finally {
      worker.terminate();
    }
  }

  private async fetchPlugin(pluginId: PluginId, options: PluginInstallOptions): Promise<Plugin> {
    const { source } = options;

    // Check if source is a URL or local path
    if (source.startsWith('http://') || source.startsWith('https://')) {
      // Fetch from remote marketplace
      const response = await fetch(source, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plugin from ${source}: ${response.statusText}`);
      }

      const plugin = await response.json();
      return plugin as Plugin;
    } else {
      // Load from local source (file path or bundled plugin)
      // In production, would use fs.readFile or similar
      throw new Error('Local plugin loading not yet supported in browser environment');
    }
  }

  private async verifyPlugin(plugin: Plugin): Promise<void> {
    // 1. Verify cryptographic signature
    const isValidSignature = await this.verifySignature(plugin.bundle, plugin.manifest.signature);

    if (!isValidSignature) {
      throw new Error('Invalid plugin signature');
    }

    // 2. Run security scan
    const scanResult = await this.scanPlugin(plugin);
    if (scanResult.status === 'dangerous') {
      throw new Error(`Security scan failed: ${scanResult.issues.join(', ')}`);
    }

    // 3. Check for known vulnerabilities
    if (plugin.security.vulnerabilities.some((v) => v.severity === 'critical')) {
      throw new Error('Plugin contains critical security vulnerabilities');
    }
  }

  private async validatePlugin(plugin: Plugin, userId: UserId): Promise<void> {
    // Check BrepFlow version compatibility
    const engineVersion = this.config.engineVersion;
    if (!this.isVersionCompatible(plugin.manifest.engines.brepflow, engineVersion)) {
      throw new Error(
        `Plugin requires BrepFlow ${plugin.manifest.engines.brepflow}, current: ${engineVersion}`
      );
    }

    // Validate permissions
    await this.validatePermissions(plugin.manifest.permissions, userId);

    // Check storage and resource limits
    await this.validateResourceRequirements(plugin, userId);
  }

  private async createSandbox(plugin: Plugin): Promise<PluginSandbox> {
    const sandbox: PluginSandbox = {
      workerId: `worker_${plugin.id}_${Date.now()}`,
      memoryLimit: plugin.manifest.permissions.wasmMemory * 1024 * 1024, // Convert MB to bytes
      networkAllowlist: plugin.manifest.permissions.networkAccess.map((n) => n.domain),
      storageQuota: plugin.manifest.permissions.storageQuota * 1024 * 1024, // Convert MB to bytes
      timeoutMs: this.config.defaultTimeout,
      isolated: true,
    };

    // Create isolated Web Worker for plugin execution
    const workerCode = `
      let pluginInstance = null;
      let pluginCapabilities = null;
      
      self.onmessage = async function(e) {
        const { type, id, data } = e.data;
        
        try {
          if (type === 'INIT') {
            // Initialize plugin from bundle
            const { code, capabilities } = data;
            pluginCapabilities = capabilities;
            
            // Execute plugin code in isolated scope
            const pluginModule = new Function('capabilities', code);
            pluginInstance = pluginModule(capabilities);
            
            self.postMessage({ type: 'INIT_SUCCESS', id });
          } else if (type === 'EXECUTE') {
            if (!pluginInstance) {
              throw new Error('Plugin not initialized');
            }
            
            const { functionName, args } = data;
            if (typeof pluginInstance[functionName] !== 'function') {
              throw new Error(\`Function \${functionName} not found in plugin\`);
            }
            
            const result = await pluginInstance[functionName](...args);
            
            self.postMessage({ type: 'EXECUTE_SUCCESS', id, result });
          } else if (type === 'TERMINATE') {
            self.close();
          }
        } catch (error) {
          self.postMessage({ 
            type: 'ERROR', 
            id, 
            error: error.message,
            stack: error.stack
          });
        }
      };
    `;

    // In production, would create actual Worker from blob
    // For now, just return sandbox metadata
    return sandbox;
  }

  private async installPluginBundle(plugin: Plugin, sandbox: PluginSandbox): Promise<void> {
    // In production, would send plugin bundle to worker and wait for initialization
    // The worker would receive the bundle code and capabilities, then execute it

    // Prepare capabilities API for plugin
    const capabilities = this.buildCapabilitiesAPI(plugin);

    // Send initialization message to worker (simulated for now)
    const initMessage = {
      type: 'INIT',
      id: `init_${Date.now()}`,
      data: {
        code: plugin.bundle.code,
        capabilities,
      },
    };

    // In production, would:
    // 1. Post message to worker
    // 2. Wait for INIT_SUCCESS response
    // 3. Handle initialization errors

    console.log(`Installed plugin bundle for ${plugin.id} in sandbox ${sandbox.workerId}`);
  }

  private buildCapabilitiesAPI(plugin: Plugin): Record<string, any> {
    const api: Record<string, any> = {};

    // Add requested capabilities
    for (const capability of plugin.manifest.permissions.capabilities) {
      const capHandler = this.capabilities.get(capability.name);
      if (capHandler) {
        api[capability.name] = capHandler.handler;
      }
    }

    return api;
  }

  private async initializePlugin(plugin: Plugin, sandbox: PluginSandbox): Promise<void> {
    // Execute plugin's onLoad lifecycle hook if it exists
    if (plugin.bundle.exports.includes('onLoad')) {
      try {
        // In production, would send EXECUTE message to worker
        const executeMessage = {
          type: 'EXECUTE',
          id: `exec_${Date.now()}`,
          data: {
            functionName: 'onLoad',
            args: [],
          },
        };

        // Simulate execution for now
        console.log(`Initialized plugin ${plugin.id} with onLoad hook`);
        this.emit('plugin-initialized', { pluginId: plugin.id });
      } catch (error) {
        throw new Error(
          `Plugin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } else {
      console.log(`Initialized plugin ${plugin.id} (no onLoad hook)`);
      this.emit('plugin-initialized', { pluginId: plugin.id });
    }
  }

  private async destroySandbox(sandbox: PluginSandbox): Promise<void> {
    try {
      // In production, would:
      // 1. Send TERMINATE message to worker
      // 2. Wait brief moment for cleanup
      // 3. Force terminate worker
      // 4. Clear worker reference

      console.log(`Destroyed sandbox ${sandbox.workerId}`);

      // Clean up any sandbox-specific resources
      // (memory, storage, network connections, etc.)
    } catch (error) {
      console.error('Sandbox destruction error:', error);
      // Force cleanup anyway
    }
  }

  private async stopPluginExecutions(pluginId: PluginId): Promise<void> {
    // Remove pending executions for this plugin
    this.executionQueue = this.executionQueue.filter((task) => task.pluginId !== pluginId);
  }

  private async cleanupPluginResources(plugin: Plugin): Promise<void> {
    const pluginId = plugin.id;

    // 1. Clear plugin storage (IndexedDB/localStorage)
    if (typeof indexedDB !== 'undefined') {
      try {
        const dbName = `plugin_storage_${pluginId}`;
        const deleteRequest = indexedDB.deleteDatabase(dbName);

        await new Promise((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve(undefined);
          deleteRequest.onerror = () => reject(deleteRequest.error);
          deleteRequest.onblocked = () => {
            console.warn(`Plugin storage deletion blocked for ${pluginId}`);
            resolve(undefined); // Continue anyway
          };
        });
      } catch (error) {
        console.warn('Failed to clean plugin IndexedDB:', error);
      }
    }

    // 2. Clear localStorage keys for plugin
    if (typeof localStorage !== 'undefined') {
      const pluginPrefix = `plugin_${pluginId}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(pluginPrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    // 3. Clear any cached data
    if (typeof caches !== 'undefined') {
      try {
        const cacheName = `plugin_cache_${pluginId}`;
        await caches.delete(cacheName);
      } catch (error) {
        console.warn('Failed to clean plugin cache:', error);
      }
    }

    console.log(`Cleaned up resources for plugin ${pluginId}`);
    this.emit('plugin-cleanup-complete', { pluginId });
  }

  private async verifySignature(
    bundle: PluginBundle,
    signature: Ed25519Signature
  ): Promise<boolean> {
    try {
      // Import subtle crypto for Ed25519 verification
      const crypto = globalThis.crypto;
      if (!crypto || !crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }

      // Convert signature public key from hex string to buffer
      const publicKeyBuffer = this.hexToBuffer(signature.publicKey);

      // Import the public key for verification
      const publicKey = await crypto.subtle.importKey(
        'raw',
        publicKeyBuffer,
        { name: 'Ed25519', namedCurve: 'Ed25519' },
        false,
        ['verify']
      );

      // Convert bundle to buffer for verification
      const bundleBuffer = new TextEncoder().encode(JSON.stringify(bundle));
      const signatureBuffer = this.hexToBuffer(signature.signature);

      // Verify the signature
      const isValid = await crypto.subtle.verify(
        'Ed25519',
        publicKey,
        signatureBuffer,
        bundleBuffer
      );

      return isValid;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private hexToBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  private async scanPlugin(plugin: Plugin): Promise<SecurityScanResult> {
    const issues: string[] = [];
    let score = 100;

    // 1. Check for dangerous eval/Function usage in code
    const codeString = JSON.stringify(plugin.bundle.code);
    if (/\beval\s*\(/.test(codeString)) {
      issues.push('Dangerous: Uses eval()');
      score -= 40;
    }
    if (/new\s+Function\s*\(/.test(codeString)) {
      issues.push('Dangerous: Uses Function constructor');
      score -= 35;
    }

    // 2. Check for suspicious network access patterns
    const hasNetworkAccess = plugin.manifest.permissions.networkAccess.length > 0;
    if (hasNetworkAccess) {
      const suspiciousDomains = plugin.manifest.permissions.networkAccess.filter(
        (n) =>
          !n.domain.match(/^https:\/\//) ||
          n.domain.includes('localhost') ||
          n.domain.includes('127.0.0.1')
      );
      if (suspiciousDomains.length > 0) {
        issues.push(`Warning: Suspicious network access to ${suspiciousDomains.length} domains`);
        score -= 10;
      }
    }

    // 3. Check excessive permission requests
    const { wasmMemory, storageQuota, networkAccess } = plugin.manifest.permissions;
    if (wasmMemory > 512) {
      issues.push('Warning: Requests excessive WASM memory (>512MB)');
      score -= 5;
    }
    if (storageQuota > 100) {
      issues.push('Warning: Requests excessive storage (>100MB)');
      score -= 5;
    }
    if (networkAccess.length > 10) {
      issues.push('Warning: Requests access to many domains');
      score -= 5;
    }

    // 4. Check for obfuscation (high entropy indicates possible obfuscation)
    const entropy = this.calculateEntropy(codeString.substring(0, 10000));
    if (entropy > 4.5) {
      issues.push('Warning: Code appears obfuscated (high entropy)');
      score -= 15;
    }

    // Determine status based on score
    let status: 'safe' | 'warning' | 'dangerous';
    if (score >= 70) {
      status = 'safe';
    } else if (score >= 40) {
      status = 'warning';
    } else {
      status = 'dangerous';
    }

    return {
      status,
      score,
      issues,
    };
  }

  private calculateEntropy(str: string): number {
    const len = str.length;
    const frequencies = new Map<string, number>();

    // Count character frequencies
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }

    // Calculate Shannon entropy
    let entropy = 0;
    for (const freq of frequencies.values()) {
      const p = freq / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  private isVersionCompatible(required: string, current: string): boolean {
    // Parse semver requirement (supports: ^1.2.3, ~1.2.3, >=1.2.3, 1.2.3)
    const requiredMatch = required.match(/^([~^>=<]*)(\d+)\.(\d+)\.(\d+)/);
    const currentMatch = current.match(/^(\d+)\.(\d+)\.(\d+)/);

    if (!requiredMatch || !currentMatch) {
      return false; // Invalid version format
    }

    const [, operator, reqMajor, reqMinor, reqPatch] = requiredMatch;
    const [, curMajor, curMinor, curPatch] = currentMatch;

    const req = { major: parseInt(reqMajor), minor: parseInt(reqMinor), patch: parseInt(reqPatch) };
    const cur = { major: parseInt(curMajor), minor: parseInt(curMinor), patch: parseInt(curPatch) };

    // Handle different operators
    if (operator === '^') {
      // Caret: compatible with same major version
      return (
        cur.major === req.major &&
        (cur.minor > req.minor || (cur.minor === req.minor && cur.patch >= req.patch))
      );
    } else if (operator === '~') {
      // Tilde: compatible with same major.minor version
      return cur.major === req.major && cur.minor === req.minor && cur.patch >= req.patch;
    } else if (operator === '>=') {
      // Greater than or equal
      return (
        cur.major > req.major ||
        (cur.major === req.major && cur.minor > req.minor) ||
        (cur.major === req.major && cur.minor === req.minor && cur.patch >= req.patch)
      );
    } else {
      // Exact match
      return cur.major === req.major && cur.minor === req.minor && cur.patch === req.patch;
    }
  }

  private async validatePermissions(permissions: PluginPermissions, userId: UserId): Promise<void> {
    // Check if user has admin privileges for elevated permissions
    const requiresElevated =
      permissions.wasmMemory > 256 ||
      permissions.storageQuota > 50 ||
      permissions.networkAccess.length > 5;

    if (requiresElevated) {
      // In production, this would check against user role/permissions service
      // For now, emit warning event for monitoring
      this.emit('permission-validation-warning', {
        userId,
        reason: 'Plugin requires elevated permissions',
        permissions,
      });
    }

    // Validate individual permission scopes
    const dangerousPermissions = permissions.networkAccess.filter(
      (n) => n.scope === 'unrestricted' || n.domain === '*'
    );

    if (dangerousPermissions.length > 0) {
      throw new Error('Plugin requests dangerous unrestricted network access');
    }
  }

  private async validateResourceRequirements(plugin: Plugin, userId: UserId): Promise<void> {
    const { wasmMemory, storageQuota } = plugin.manifest.permissions;

    // Define resource limits per user tier (would come from config/database in production)
    const userQuotas = {
      maxPluginMemory: 512, // MB
      maxPluginStorage: 100, // MB
      maxTotalPlugins: 10,
    };

    // Check plugin resource requirements against user quotas
    if (wasmMemory > userQuotas.maxPluginMemory) {
      throw new Error(
        `Plugin memory requirement (${wasmMemory}MB) exceeds user quota (${userQuotas.maxPluginMemory}MB)`
      );
    }

    if (storageQuota > userQuotas.maxPluginStorage) {
      throw new Error(
        `Plugin storage requirement (${storageQuota}MB) exceeds user quota (${userQuotas.maxPluginStorage}MB)`
      );
    }

    // Check total number of installed plugins
    const userPlugins = this.getInstalledPlugins(userId);
    if (userPlugins.length >= userQuotas.maxTotalPlugins) {
      throw new Error(
        `Maximum number of plugins (${userQuotas.maxTotalPlugins}) already installed`
      );
    }
  }

  private async enablePlugin(plugin: Plugin): Promise<void> {
    // Mark plugin as enabled in metadata
    plugin.manifest.enabled = true;

    // Emit event for plugin state change
    this.emit('plugin-enabled', { pluginId: plugin.id });
  }

  private async disablePlugin(plugin: Plugin): Promise<void> {
    // Stop any running executions
    await this.stopPluginExecutions(plugin.id);

    // Mark plugin as disabled
    plugin.manifest.enabled = false;

    // Emit event for plugin state change
    this.emit('plugin-disabled', { pluginId: plugin.id });
  }

  private async getPluginStorageUsage(pluginId: PluginId): Promise<number> {
    // In production, would query actual storage backend
    // For now, return estimate based on tracked data
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin) return 0;

    // Estimate: bundle size + potential cache/data (simplified)
    const bundleSize = JSON.stringify(plugin.bundle).length;
    return Math.floor(bundleSize / (1024 * 1024)); // Convert to MB
  }

  private async backupPlugin(pluginId: PluginId): Promise<PluginBackup> {
    const plugin = this.installedPlugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Create comprehensive backup of plugin state
    const backup: PluginBackup = {
      timestamp: Date.now(),
      plugin: {
        id: plugin.id,
        manifest: { ...plugin.manifest },
        bundle: { ...plugin.bundle },
        metadata: { ...plugin.metadata },
        security: { ...plugin.security },
      },
      storage: {},
    };

    // Backup plugin storage data from localStorage
    if (typeof localStorage !== 'undefined') {
      const pluginPrefix = `plugin_${pluginId}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(pluginPrefix)) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            backup.storage[key] = value;
          }
        }
      }
    }

    return backup;
  }

  private async restorePlugin(backup: PluginBackup): Promise<void> {
    const { plugin, storage } = backup;

    // 1. Restore plugin to installed plugins map
    this.installedPlugins.set(plugin.id as PluginId, plugin);

    // 2. Restore localStorage data
    if (typeof localStorage !== 'undefined') {
      for (const [key, value] of Object.entries(storage)) {
        if (value !== null && value !== undefined) {
          localStorage.setItem(key, value);
        }
      }
    }

    // 3. Recreate sandbox and reinitialize
    const sandbox = await this.createSandbox(plugin);
    await this.installPluginBundle(plugin, sandbox);
    await this.initializePlugin(plugin, sandbox);

    this.emit('plugin-restored', { pluginId: plugin.id });
  }

  private async validatePluginUpdate(pluginId: PluginId, newPlugin: Plugin): Promise<void> {
    const currentPlugin = this.installedPlugins.get(pluginId);
    if (!currentPlugin) {
      throw new Error('Cannot update: plugin not installed');
    }

    // 1. Check version compatibility (must be newer)
    const currentVersion = currentPlugin.manifest.version;
    const newVersion = newPlugin.manifest.version;

    if (!this.isVersionNewer(newVersion, currentVersion)) {
      throw new Error(`Update version ${newVersion} is not newer than current ${currentVersion}`);
    }

    // 2. Validate manifest compatibility
    if (newPlugin.manifest.id !== currentPlugin.manifest.id) {
      throw new Error('Plugin ID mismatch - cannot update to different plugin');
    }

    // 3. Check for breaking changes in required engine version
    const newEngineReq = newPlugin.manifest.engines.brepflow;

    if (!this.isVersionCompatible(newEngineReq, this.config.engineVersion)) {
      throw new Error(
        `Update requires engine version ${newEngineReq}, current is ${this.config.engineVersion}`
      );
    }

    // 4. Validate that new permissions don't exceed current significantly
    const currentPerms = currentPlugin.manifest.permissions;
    const newPerms = newPlugin.manifest.permissions;

    if (newPerms.wasmMemory > currentPerms.wasmMemory * 2) {
      throw new Error('Update requests significantly more memory than current version');
    }

    if (newPerms.storageQuota > currentPerms.storageQuota * 2) {
      throw new Error('Update requests significantly more storage than current version');
    }

    // 5. Run security scan on new version
    const scanResult = await this.scanPlugin(newPlugin);
    if (scanResult.status === 'dangerous') {
      throw new Error(`Update failed security scan: ${scanResult.issues.join(', ')}`);
    }
  }

  private isVersionNewer(newVersion: string, currentVersion: string): boolean {
    const parseVersion = (v: string) => {
      const match = v.match(/^\d+\.\d+\.\d+/);
      if (!match) return null;
      const parts = match[0].split('.');
      return {
        major: parseInt(parts[0]),
        minor: parseInt(parts[1]),
        patch: parseInt(parts[2]),
      };
    };

    const newVer = parseVersion(newVersion);
    const curVer = parseVersion(currentVersion);

    if (!newVer || !curVer) return false;

    return (
      newVer.major > curVer.major ||
      (newVer.major === curVer.major && newVer.minor > curVer.minor) ||
      (newVer.major === curVer.major &&
        newVer.minor === curVer.minor &&
        newVer.patch > curVer.patch)
    );
  }

  private initializeCapabilities(): void {
    // Initialize built-in capabilities
    this.capabilities.set('geometry', {
      name: 'geometry',
      version: '1.0.0',
      permissions: ['read', 'write'],
      handler: this.createGeometryCapability(),
    });

    this.capabilities.set('storage', {
      name: 'storage',
      version: '1.0.0',
      permissions: ['read', 'write'],
      handler: this.createStorageCapability(),
    });

    this.capabilities.set('network', {
      name: 'network',
      version: '1.0.0',
      permissions: ['request'],
      handler: this.createNetworkCapability(),
    });
  }

  private createGeometryCapability() {
    return async (context: PluginExecutionContext, operation: string, params: any) => {
      // Validate plugin has geometry permission
      const plugin = this.installedPlugins.get(context.pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      const hasGeometryPerm = plugin.manifest.permissions.capabilities.some(
        (cap) => cap.name === 'geometry'
      );

      if (!hasGeometryPerm) {
        throw new Error('Plugin does not have geometry capability permission');
      }

      // Dispatch geometry operations to engine
      // In production, would integrate with @brepflow/engine-core
      switch (operation) {
        case 'createBox':
          return { type: 'shape', id: 'box_' + Date.now(), ...params };

        case 'createSphere':
          return { type: 'shape', id: 'sphere_' + Date.now(), ...params };

        case 'boolean':
          return { type: 'shape', id: 'boolean_' + Date.now(), ...params };

        case 'tessellate':
          // Would call OCCT tessellation
          return { vertices: [], indices: [], normals: [] };

        default:
          throw new Error(`Unknown geometry operation: ${operation}`);
      }
    };
  }

  private createStorageCapability() {
    return async (context: PluginExecutionContext, operation: string, params: any) => {
      // Validate plugin has storage permission
      const plugin = this.installedPlugins.get(context.pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      const hasStoragePerm = plugin.manifest.permissions.capabilities.some(
        (cap) => cap.name === 'storage'
      );

      if (!hasStoragePerm) {
        throw new Error('Plugin does not have storage capability permission');
      }

      const storagePrefix = `plugin_${context.pluginId}_`;

      // Implement storage operations with quota enforcement
      switch (operation) {
        case 'get':
          if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(storagePrefix + params.key);
          }
          return null;

        case 'set':
          if (typeof localStorage !== 'undefined') {
            // Check storage quota
            const currentUsage = await this.getPluginStorageUsage(context.pluginId);
            const quota = plugin.manifest.permissions.storageQuota;

            if (currentUsage >= quota) {
              throw new Error(`Storage quota exceeded (${quota}MB)`);
            }

            localStorage.setItem(storagePrefix + params.key, params.value);
          }
          return true;

        case 'remove':
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(storagePrefix + params.key);
          }
          return true;

        case 'clear':
          if (typeof localStorage !== 'undefined') {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith(storagePrefix)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));
          }
          return true;

        default:
          throw new Error(`Unknown storage operation: ${operation}`);
      }
    };
  }

  private createNetworkCapability() {
    return async (context: PluginExecutionContext, operation: string, params: any) => {
      // Validate plugin has network permission
      const plugin = this.installedPlugins.get(context.pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      const hasNetworkPerm = plugin.manifest.permissions.capabilities.some(
        (cap) => cap.name === 'network'
      );

      if (!hasNetworkPerm) {
        throw new Error('Plugin does not have network capability permission');
      }

      // Implement network operations with domain whitelisting
      switch (operation) {
        case 'fetch': {
          const { url, options } = params;

          // Validate URL against whitelist
          const urlObj = new URL(url);
          const allowedDomains = plugin.manifest.permissions.networkAccess;

          const isAllowed = allowedDomains.some((access) => {
            const domainPattern = access.domain.replace('*', '.*');
            const regex = new RegExp(`^${domainPattern}$`);
            return regex.test(urlObj.hostname);
          });

          if (!isAllowed) {
            throw new Error(`Network access denied: ${urlObj.hostname} not in whitelist`);
          }

          // Execute fetch with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              body: await response.text(),
            };
          } catch (error) {
            clearTimeout(timeoutId);
            throw new Error(
              `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        default:
          throw new Error(`Unknown network operation: ${operation}`);
      }
    };
  }
}

interface PluginExecutionTask {
  id: string;
  pluginId: PluginId;
  functionName: string;
  args: any[];
  context: PluginExecutionContext;
  createdAt: number;
  resolve?: (result: PluginExecutionResult) => void;
  reject?: (error: Error) => void;
}

interface PluginManagerConfig {
  engineVersion: string;
  defaultTimeout: number;
  maxConcurrentExecutions: number;
  sandboxMemoryLimit: number;
  allowUnsignedPlugins: boolean;
}
