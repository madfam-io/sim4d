/**
 * BrepFlow Plugin SDK
 * Provides API for third-party developers to create custom nodes and extensions
 */

import type { NodeDefinition, EvalContext, WorkerAPI } from '@brepflow/types';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  homepage?: string;
  license?: string;

  // Plugin capabilities
  nodes?: string[]; // Node type IDs provided
  commands?: string[]; // Command IDs provided
  panels?: string[]; // UI panel IDs provided
  themes?: string[]; // Theme IDs provided

  // Dependencies
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;

  // Security
  permissions?: PluginPermission[];
  signature?: string; // Ed25519 signature for verification
}

export enum PluginPermission {
  // Data access
  READ_GRAPH = 'read:graph',
  WRITE_GRAPH = 'write:graph',
  READ_FILES = 'read:files',
  WRITE_FILES = 'write:files',

  // Network
  NETWORK_FETCH = 'network:fetch',
  NETWORK_WEBSOCKET = 'network:websocket',

  // System
  WORKER_SPAWN = 'worker:spawn',
  WASM_EXECUTE = 'wasm:execute',

  // UI
  UI_MODAL = 'ui:modal',
  UI_NOTIFICATION = 'ui:notification',
  UI_PANEL = 'ui:panel',

  // Advanced
  NATIVE_CODE = 'native:code',
  SYSTEM_INFO = 'system:info',
}

export interface PluginContext {
  // Core APIs
  worker: WorkerAPI;
  logger: Logger;
  storage: Storage;
  events: EventEmitter;

  // UI APIs (optional)
  ui?: UIContext;
  viewport?: ViewportContext;

  // Advanced APIs (requires permissions)
  network?: NetworkContext;
  files?: FileSystemContext;
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error): void;
}

export interface Storage {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface EventEmitter {
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  once(event: string, handler: Function): void;
  emit(event: string, ...args: unknown[]): void;
}

export interface UIContext {
  showModal(options: ModalOptions): Promise<unknown>;
  showNotification(options: NotificationOptions): void;
  registerPanel(panel: PanelDefinition): void;
  updatePanel(panelId: string, state: unknown): void;
}

export interface ViewportContext {
  getCamera(): CameraState;
  setCamera(state: CameraState): void;
  addOverlay(overlay: ViewportOverlay): string;
  removeOverlay(overlayId: string): void;
  captureScreenshot(): Promise<Blob>;
}

export interface NetworkContext {
  fetch(url: string, options?: RequestInit): Promise<Response>;
  websocket(url: string, protocols?: string[]): WebSocket;
}

export interface FileSystemContext {
  readFile(path: string): Promise<ArrayBuffer>;
  writeFile(path: string, data: ArrayBuffer): Promise<void>;
  listFiles(directory: string): Promise<string[]>;
  deleteFile(path: string): Promise<void>;
}

/**
 * Plugin base class
 */
export abstract class BrepFlowPlugin {
  protected context!: PluginContext;

  abstract get manifest(): PluginManifest;

  /**
   * Called when plugin is loaded
   */
  async onLoad(context: PluginContext): Promise<void> {
    this.context = context;
    this.context.logger.info(`Plugin ${this.manifest.name} v${this.manifest.version} loaded`);
  }

  /**
   * Called when plugin is activated
   */
  async onActivate(): Promise<void> {
    this.context.logger.debug(`Plugin ${this.manifest.name} activated`);
  }

  /**
   * Called when plugin is deactivated
   */
  async onDeactivate(): Promise<void> {
    this.context.logger.debug(`Plugin ${this.manifest.name} deactivated`);
  }

  /**
   * Called when plugin is unloaded
   */
  async onUnload(): Promise<void> {
    this.context.logger.info(`Plugin ${this.manifest.name} unloaded`);
  }

  /**
   * Register custom nodes provided by this plugin
   */
  getNodes(): NodeDefinition[] {
    return [];
  }

  /**
   * Register custom commands
   */
  getCommands(): CommandDefinition[] {
    return [];
  }

  /**
   * Register UI panels
   */
  getPanels(): PanelDefinition[] {
    return [];
  }
}

/**
 * Parameter options based on type
 */
type ParamOptions = {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  description?: string;
};

/**
 * Node builder for simplified node creation
 */
export class NodeBuilder<I = Record<string, unknown>, O = Record<string, unknown>, P = Record<string, unknown>> {
  private definition: Partial<NodeDefinition<I, O, P>> = {};

  constructor(id: string) {
    this.definition.id = id;
  }

  name(name: string): this {
    this.definition.name = name;
    return this;
  }

  description(desc: string): this {
    this.definition.description = desc;
    return this;
  }

  category(category: string): this {
    this.definition.category = category;
    return this;
  }

  input<K extends keyof I>(name: K, type: string, description?: string): this {
    if (!this.definition.inputs) {
      this.definition.inputs = {} as unknown;
    }
    this.definition.inputs![name as string] = { type, description };
    return this;
  }

  output<K extends keyof O>(name: K, type: string, description?: string): this {
    if (!this.definition.outputs) {
      this.definition.outputs = {} as unknown;
    }
    this.definition.outputs![name as string] = { type, description };
    return this;
  }

  param<K extends keyof P>(
    name: K,
    type: 'number' | 'string' | 'boolean' | 'select',
    defaultValue: P[K],
    options?: ParamOptions
  ): this {
    if (!this.definition.params) {
      this.definition.params = {} as unknown;
    }
    this.definition.params![name as string] = {
      type,
      default: defaultValue,
      ...options,
    };
    return this;
  }

  evaluate(fn: (ctx: EvalContext, inputs: I, params: P) => Promise<O>): this {
    this.definition.evaluate = fn;
    return this;
  }

  build(): NodeDefinition<I, O, P> {
    if (!this.definition.id) throw new Error('Node ID is required');
    if (!this.definition.evaluate) throw new Error('Evaluate function is required');
    return this.definition as NodeDefinition<I, O, P>;
  }
}

/**
 * Command definition for custom commands
 */
export interface CommandDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  execute(context: PluginContext, ...args: unknown[]): Promise<void>;
}

/**
 * Panel definition for custom UI panels
 */
export interface PanelDefinition {
  id: string;
  title: string;
  icon?: string;
  position?: 'left' | 'right' | 'bottom';
  minWidth?: number;
  minHeight?: number;
  render(): HTMLElement | Promise<HTMLElement>;
  onMount?(): void;
  onUnmount?(): void;
  onResize?(width: number, height: number): void;
}

/**
 * UI type definitions
 */
export interface ModalOptions {
  title: string;
  content: HTMLElement | string;
  buttons?: ModalButton[];
  width?: number;
  height?: number;
  closable?: boolean;
}

export interface ModalButton {
  text: string;
  type?: 'primary' | 'secondary' | 'danger';
  onClick: () => void | Promise<void>;
}

export interface NotificationOptions {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  text: string;
  onClick: () => void;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

/**
 * Viewport overlay style options
 */
export interface ViewportOverlayStyle {
  color?: string;
  opacity?: number;
  lineWidth?: number;
  fontSize?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ViewportOverlay {
  type: 'line' | 'text' | 'mesh';
  data: unknown;
  style?: ViewportOverlayStyle;
}

/**
 * Plugin loader and manager
 */
export class PluginManager {
  private plugins = new Map<string, BrepFlowPlugin>();
  private contexts = new Map<string, PluginContext>();

  /**
   * Load a plugin from URL or package
   */
  async loadPlugin(source: string | BrepFlowPlugin): Promise<void> {
    let plugin: BrepFlowPlugin;

    if (typeof source === 'string') {
      // Load from URL
      const module = await import(source);
      const PluginClass = module.default || module.Plugin;
      if (!PluginClass) {
        throw new Error(`No plugin class found in ${source}`);
      }
      plugin = new PluginClass();
    } else {
      plugin = source;
    }

    const manifest = plugin.manifest;

    // Validate manifest
    this.validateManifest(manifest);

    // Check permissions
    await this.checkPermissions(manifest);

    // Create sandboxed context
    const context = this.createContext(manifest);

    // Initialize plugin
    await plugin.onLoad(context);

    // Store plugin
    this.plugins.set(manifest.id, plugin);
    this.contexts.set(manifest.id, context);

    // Register components
    this.registerPluginComponents(plugin);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    await plugin.onUnload();

    this.plugins.delete(pluginId);
    this.contexts.delete(pluginId);

    // Unregister components
    this.unregisterPluginComponents(pluginId);
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

    await plugin.onActivate();
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

    await plugin.onDeactivate();
  }

  /**
   * Get loaded plugins
   */
  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id) throw new Error('Plugin ID is required');
    if (!manifest.name) throw new Error('Plugin name is required');
    if (!manifest.version) throw new Error('Plugin version is required');

    // Validate version format (semver)
    if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      throw new Error('Invalid version format');
    }
  }

  private async checkPermissions(manifest: PluginManifest): Promise<void> {
    if (!manifest.permissions) return;

    // In production, would show permission dialog to user
    const granted = await this.requestPermissions(manifest.permissions);
    if (!granted) {
      throw new Error('Required permissions not granted');
    }
  }

  private async requestPermissions(permissions: PluginPermission[]): Promise<boolean> {
    // Simplified - in production would show UI dialog
    logger.info('Requesting permissions:', permissions);
    return true;
  }

  private createContext(manifest: PluginManifest): PluginContext {
    // Create sandboxed context based on permissions
    const context: PluginContext = {
      worker: this.createWorkerProxy(manifest),
      logger: this.createLogger(manifest.id),
      storage: this.createStorage(manifest.id),
      events: this.createEventEmitter(manifest.id),
    };

    // Add optional APIs based on permissions
    if (manifest.permissions?.includes(PluginPermission.UI_PANEL)) {
      context.ui = this.createUIContext(manifest.id);
    }

    if (manifest.permissions?.includes(PluginPermission.NETWORK_FETCH)) {
      context.network = this.createNetworkContext(manifest.id);
    }

    return context;
  }

  private createWorkerProxy(manifest: PluginManifest): WorkerAPI {
    // Return proxied worker API with permission checks
    return {} as WorkerAPI;
  }

  private createLogger(pluginId: string): Logger {
    return {
      debug: (msg, ...args) => logger.debug(`[${pluginId}]`, msg, ...args),
      info: (msg, ...args) => logger.info(`[${pluginId}]`, msg, ...args),
      warn: (msg, ...args) => logger.warn(`[${pluginId}]`, msg, ...args),
      error: (msg, err) => logger.error(`[${pluginId}]`, msg, err),
    };
  }

  private createStorage(pluginId: string): Storage {
    const prefix = `plugin:${pluginId}:`;
    return {
      async get(key) {
        const value = localStorage.getItem(prefix + key);
        return value ? JSON.parse(value) : null;
      },
      async set(key, value) {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      },
      async delete(key) {
        localStorage.removeItem(prefix + key);
      },
      async clear() {
        const keys = await this.keys();
        keys.forEach((key) => localStorage.removeItem(prefix + key));
      },
      async keys() {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(prefix)) {
            keys.push(key.slice(prefix.length));
          }
        }
        return keys;
      },
    };
  }

  private createEventEmitter(pluginId: string): EventEmitter {
    const handlers = new Map<string, Set<Function>>();
    return {
      on(event, handler) {
        if (!handlers.has(event)) {
          handlers.set(event, new Set());
        }
        handlers.get(event)!.add(handler);
      },
      off(event, handler) {
        handlers.get(event)?.delete(handler);
      },
      once(event, handler) {
        const wrapper = (...args: unknown[]) => {
          handler(...args);
          this.off(event, wrapper);
        };
        this.on(event, wrapper);
      },
      emit(event, ...args) {
        handlers.get(event)?.forEach((handler) => handler(...args));
      },
    };
  }

  private createUIContext(pluginId: string): UIContext {
    // Return UI context implementation
    return {} as UIContext;
  }

  private createNetworkContext(pluginId: string): NetworkContext {
    // Return network context with CORS proxy
    return {} as NetworkContext;
  }

  private registerPluginComponents(plugin: BrepFlowPlugin): void {
    // Register nodes, commands, panels
    const nodes = plugin.getNodes();
    const commands = plugin.getCommands();
    const panels = plugin.getPanels();

    // Would register with main app here
    logger.info(
      `Registered ${nodes.length} nodes, ${commands.length} commands, ${panels.length} panels`
    );
  }

  private unregisterPluginComponents(pluginId: string): void {
    // Unregister all components from this plugin
    logger.info(`Unregistered components for ${pluginId}`);
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();
