/**
 * Node configuration management for export/import and templates
 */

import type { NodeInstance, NodeId } from '@brepflow/types';
import { createNodeId } from '@brepflow/types';
import { createChildLogger } from '../logging/logger-instance';

const logger = createChildLogger({ module: 'node-config' });

export interface NodeConfiguration {
  id: string;
  name: string;
  description?: string;
  nodeType: string;
  parameters: Record<string, unknown>;
  metadata: NodeMetadata;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface NodeMetadata {
  author?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime?: string;
  dependencies?: string[]; // Required node types
  notes?: string;
  thumbnail?: string; // Base64 encoded image
  usage?: {
    timesUsed: number;
    lastUsed: Date;
    averageRating?: number;
  };
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configurations: NodeConfiguration[];
  connections?: Array<{
    sourceId: string;
    sourceOutput: string;
    targetId: string;
    targetInput: string;
  }>;
  layout?: {
    positions: Record<string, { x: number; y: number }>;
    zoom?: number;
    center?: { x: number; y: number };
  };
  metadata: {
    author: string;
    version: string;
    createdAt: Date;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedTime?: string;
  };
}

export class NodeConfigurationManager {
  private static instance: NodeConfigurationManager | null = null;
  private configurations: Map<string, NodeConfiguration> = new Map();
  private templates: Map<string, ConfigurationTemplate> = new Map();
  private readonly STORAGE_KEY_CONFIGS = 'brepflow_node_configurations';
  private readonly STORAGE_KEY_TEMPLATES = 'brepflow_configuration_templates';

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): NodeConfigurationManager {
    if (!NodeConfigurationManager.instance) {
      NodeConfigurationManager.instance = new NodeConfigurationManager();
    }
    return NodeConfigurationManager.instance;
  }

  /**
   * Export node configuration
   */
  public exportNodeConfiguration(
    node: NodeInstance,
    metadata: Partial<NodeMetadata> = {}
  ): NodeConfiguration {
    const config: NodeConfiguration = {
      id: this.generateId(),
      name: metadata.category ? `${metadata.category} - ${node.type}` : node.type,
      description: metadata.notes || `Configuration for ${node.type} node`,
      nodeType: node.type,
      parameters: { ...node.params },
      metadata: {
        category: metadata.category || this.inferCategory(node.type),
        difficulty: metadata.difficulty || 'intermediate',
        estimatedTime: metadata.estimatedTime || 'unknown',
        dependencies: this.inferDependencies(node.type),
        notes: metadata.notes,
        author: metadata.author || 'Unknown',
        usage: {
          timesUsed: 0,
          lastUsed: new Date(),
        },
        ...metadata,
      },
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.generateTags(node.type),
    };

    // Store the configuration
    this.configurations.set(config.id, config);
    this.saveToStorage();

    return config;
  }

  /**
   * Import node configuration and create node instance
   */
  public importNodeConfiguration(
    configId: string,
    position?: { x: number; y: number }
  ): NodeInstance | null {
    const config = this.configurations.get(configId);
    if (!config) {
      return null;
    }

    // Update usage statistics
    config.metadata.usage!.timesUsed++;
    config.metadata.usage!.lastUsed = new Date();
    config.updatedAt = new Date();

    const nodeInstance: NodeInstance = {
      id: this.generateNodeId(),
      type: config.nodeType,
      params: { ...config.parameters },
      inputs: {},
      outputs: {},
      position: position || { x: 0, y: 0 },
      dirty: true,
      state: {
        error: null,
        computing: false,
        result: null,
      },
    };

    this.saveToStorage();
    return nodeInstance;
  }

  /**
   * Get all saved configurations
   */
  public getAllConfigurations(): NodeConfiguration[] {
    return Array.from(this.configurations.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Get configurations by category
   */
  public getConfigurationsByCategory(category: string): NodeConfiguration[] {
    return Array.from(this.configurations.values())
      .filter((config) => config.metadata.category === category)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get configurations by node type
   */
  public getConfigurationsByNodeType(nodeType: string): NodeConfiguration[] {
    return Array.from(this.configurations.values())
      .filter((config) => config.nodeType === nodeType)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Search configurations
   */
  public searchConfigurations(query: string): NodeConfiguration[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.configurations.values())
      .filter(
        (config) =>
          config.name.toLowerCase().includes(searchTerm) ||
          config.description?.toLowerCase().includes(searchTerm) ||
          config.nodeType.toLowerCase().includes(searchTerm) ||
          config.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          config.metadata.category?.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Update configuration
   */
  public updateConfiguration(configId: string, updates: Partial<NodeConfiguration>): boolean {
    const config = this.configurations.get(configId);
    if (!config) {
      return false;
    }

    Object.assign(config, updates, { updatedAt: new Date() });
    this.saveToStorage();
    return true;
  }

  /**
   * Delete configuration
   */
  public deleteConfiguration(configId: string): boolean {
    const deleted = this.configurations.delete(configId);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Export configuration to JSON
   */
  public exportToJSON(configId: string): string | null {
    const config = this.configurations.get(configId);
    if (!config) {
      return null;
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  public importFromJSON(jsonString: string): NodeConfiguration | null {
    try {
      const config = JSON.parse(jsonString) as NodeConfiguration;

      // Validate structure
      if (!this.isValidConfiguration(config)) {
        throw new Error('Invalid configuration structure');
      }

      // Generate new ID and update timestamps
      config.id = this.generateId();
      config.createdAt = new Date();
      config.updatedAt = new Date();

      this.configurations.set(config.id, config);
      this.saveToStorage();

      return config;
    } catch (error) {
      logger.error('Failed to import configuration:', error);
      return null;
    }
  }

  /**
   * Export multiple configurations as a template
   */
  public createTemplate(
    name: string,
    description: string,
    category: string,
    configIds: string[],
    connections: Array<{
      sourceId: string;
      sourceOutput: string;
      targetId: string;
      targetInput: string;
    }> = [],
    layout?: {
      positions: Record<string, { x: number; y: number }>;
      zoom?: number;
      center?: { x: number; y: number };
    },
    metadata: Partial<ConfigurationTemplate['metadata']> = {}
  ): ConfigurationTemplate | null {
    const configurations = configIds
      .map((id) => this.configurations.get(id))
      .filter(Boolean) as NodeConfiguration[];

    if (configurations.length === 0) {
      return null;
    }

    const template: ConfigurationTemplate = {
      id: this.generateId(),
      name,
      description,
      category,
      configurations,
      connections,
      layout,
      metadata: {
        author: metadata.author || 'Unknown',
        version: metadata.version || '1.0.0',
        createdAt: new Date(),
        tags: metadata.tags || [],
        difficulty: metadata.difficulty || 'intermediate',
        estimatedTime: metadata.estimatedTime,
        ...metadata,
      },
    };

    this.templates.set(template.id, template);
    this.saveToStorage();

    return template;
  }

  /**
   * Get all templates
   */
  public getAllTemplates(): ConfigurationTemplate[] {
    return Array.from(this.templates.values()).sort(
      (a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
    );
  }

  /**
   * Get templates by category
   */
  public getTemplatesByCategory(category: string): ConfigurationTemplate[] {
    return Array.from(this.templates.values())
      .filter((template) => template.category === category)
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  /**
   * Export template to JSON
   */
  public exportTemplateToJSON(templateId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Get configuration statistics
   */
  public getStatistics(): {
    totalConfigurations: number;
    totalTemplates: number;
    configurationsByCategory: Record<string, number>;
    configurationsByNodeType: Record<string, number>;
    mostUsedConfigurations: Array<{ config: NodeConfiguration; usageCount: number }>;
    recentConfigurations: NodeConfiguration[];
  } {
    const configs = Array.from(this.configurations.values());

    const configurationsByCategory: Record<string, number> = {};
    const configurationsByNodeType: Record<string, number> = {};

    configs.forEach((config) => {
      const category = config.metadata.category || 'Unknown';
      const nodeType = config.nodeType;

      configurationsByCategory[category] = (configurationsByCategory[category] || 0) + 1;
      configurationsByNodeType[nodeType] = (configurationsByNodeType[nodeType] || 0) + 1;
    });

    const mostUsedConfigurations = configs
      .map((config) => ({
        config,
        usageCount: config.metadata.usage?.timesUsed || 0,
      }))
      .filter((item) => item.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);

    const recentConfigurations = configs
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    return {
      totalConfigurations: configs.length,
      totalTemplates: this.templates.size,
      configurationsByCategory,
      configurationsByNodeType,
      mostUsedConfigurations,
      recentConfigurations,
    };
  }

  private loadFromStorage(): void {
    try {
      // Load configurations
      const configsData = localStorage.getItem(this.STORAGE_KEY_CONFIGS);
      if (configsData) {
        const parsed = JSON.parse(configsData);
        for (const [id, config] of Object.entries(parsed)) {
          this.configurations.set(id, this.deserializeConfiguration(config as unknown));
        }
      }

      // Load templates
      const templatesData = localStorage.getItem(this.STORAGE_KEY_TEMPLATES);
      if (templatesData) {
        const parsed = JSON.parse(templatesData);
        for (const [id, template] of Object.entries(parsed)) {
          this.templates.set(id, this.deserializeTemplate(template as unknown));
        }
      }
    } catch (error) {
      logger.error('Failed to load configurations from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Save configurations
      const configsData = Object.fromEntries(
        Array.from(this.configurations.entries()).map(([id, config]) => [
          id,
          this.serializeConfiguration(config),
        ])
      );
      localStorage.setItem(this.STORAGE_KEY_CONFIGS, JSON.stringify(configsData));

      // Save templates
      const templatesData = Object.fromEntries(
        Array.from(this.templates.entries()).map(([id, template]) => [
          id,
          this.serializeTemplate(template),
        ])
      );
      localStorage.setItem(this.STORAGE_KEY_TEMPLATES, JSON.stringify(templatesData));
    } catch (error) {
      logger.error('Failed to save configurations to storage:', error);
    }
  }

  private serializeConfiguration(config: NodeConfiguration): any {
    return {
      ...config,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
      metadata: {
        ...config.metadata,
        usage: config.metadata.usage
          ? {
              ...config.metadata.usage,
              lastUsed: config.metadata.usage.lastUsed.toISOString(),
            }
          : undefined,
      },
    };
  }

  private deserializeConfiguration(data: unknown): NodeConfiguration {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      metadata: {
        ...data.metadata,
        usage: data.metadata.usage
          ? {
              ...data.metadata.usage,
              lastUsed: new Date(data.metadata.usage.lastUsed),
            }
          : undefined,
      },
    };
  }

  private serializeTemplate(template: ConfigurationTemplate): any {
    return {
      ...template,
      configurations: template.configurations.map((config) => this.serializeConfiguration(config)),
      metadata: {
        ...template.metadata,
        createdAt: template.metadata.createdAt.toISOString(),
      },
    };
  }

  private deserializeTemplate(data: unknown): ConfigurationTemplate {
    return {
      ...data,
      configurations: data.configurations.map((config: any) =>
        this.deserializeConfiguration(config)
      ),
      metadata: {
        ...data.metadata,
        createdAt: new Date(data.metadata.createdAt),
      },
    };
  }

  private isValidConfiguration(config: any): config is NodeConfiguration {
    return (
      typeof config === 'object' &&
      typeof config.nodeType === 'string' &&
      typeof config.parameters === 'object' &&
      typeof config.metadata === 'object' &&
      typeof config.version === 'string'
    );
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNodeId(): NodeId {
    return createNodeId(`node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }

  private inferCategory(nodeType: string): string {
    const parts = nodeType.split('::');
    return parts[0] || 'General';
  }

  private inferDependencies(nodeType: string): string[] {
    // This could be enhanced with a dependency map
    const dependencyMap: Record<string, string[]> = {
      'Features::Fillet': ['Solid::Box', 'Solid::Cylinder'],
      'Features::Chamfer': ['Solid::Box', 'Solid::Cylinder'],
      'Boolean::Union': ['Solid::Box', 'Solid::Cylinder', 'Solid::Sphere'],
      'Boolean::Intersection': ['Solid::Box', 'Solid::Cylinder', 'Solid::Sphere'],
      'Boolean::Difference': ['Solid::Box', 'Solid::Cylinder', 'Solid::Sphere'],
    };

    return dependencyMap[nodeType] || [];
  }

  private generateTags(nodeType: string): string[] {
    const category = this.inferCategory(nodeType);
    const operation = nodeType.split('::')[1] || nodeType;

    const tags = [category.toLowerCase(), operation.toLowerCase()];

    // Add additional contextual tags
    if (category === 'Solid') {
      tags.push('geometry', 'primitive');
    } else if (category === 'Features') {
      tags.push('modification', 'editing');
    } else if (category === 'Boolean') {
      tags.push('combination', 'csg');
    } else if (category === 'Transform') {
      tags.push('transformation', 'positioning');
    }

    return tags;
  }
}
