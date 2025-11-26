/**
 * Enhanced Node Registry for Dynamic Discovery
 * Enables access to all 1012+ generated nodes with search and categorization
 */

import { NodeDefinition } from '@sim4d/types';

export interface NodeMetadata {
  label: string;
  description: string;
  tags: string[];
  category: string;
  subcategory?: string;
  examples?: string[];
  documentation?: string;
}

export interface CategoryTree {
  [category: string]: {
    nodes: NodeDefinition[];
    subcategories: {
      [subcategory: string]: NodeDefinition[];
    };
  };
}

export interface SearchIndex {
  byName: Map<string, NodeDefinition[]>;
  byTag: Map<string, NodeDefinition[]>;
  byCategory: Map<string, NodeDefinition[]>;
  byDescription: Map<string, NodeDefinition[]>;
}

export class EnhancedNodeRegistry {
  private static instance: EnhancedNodeRegistry;
  private nodes: Map<string, NodeDefinition> = new Map();
  private categoryTree: CategoryTree = {};
  private searchIndex: SearchIndex = {
    byName: new Map(),
    byTag: new Map(),
    byCategory: new Map(),
    byDescription: new Map(),
  };

  static getInstance(): EnhancedNodeRegistry {
    if (!EnhancedNodeRegistry.instance) {
      EnhancedNodeRegistry.instance = new EnhancedNodeRegistry();
    }
    return EnhancedNodeRegistry.instance;
  }

  /**
   * Register a single node with enhanced indexing
   */
  registerNode(node: NodeDefinition): void {
    this.nodes.set(node.type, node);
    this.updateCategoryTree(node);
    this.updateSearchIndex(node);
  }

  /**
   * Register multiple nodes efficiently
   */
  registerNodes(nodes: NodeDefinition[]): void {
    nodes.forEach((node) => this.registerNode(node));
  }

  /**
   * Get all registered nodes
   */
  getAllNodes(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get total node count
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get node by type identifier
   */
  getNode(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  /**
   * Get all nodes in a category
   */
  getNodesByCategory(category: string): NodeDefinition[] {
    return this.categoryTree[category]?.nodes || [];
  }

  /**
   * Get all nodes in a subcategory
   */
  getNodesBySubcategory(category: string, subcategory: string): NodeDefinition[] {
    return this.categoryTree[category]?.subcategories[subcategory] || [];
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Object.keys(this.categoryTree);
  }

  /**
   * Get subcategories for a category
   */
  getSubcategories(category: string): string[] {
    return Object.keys(this.categoryTree[category]?.subcategories || {});
  }

  /**
   * Get complete category tree structure
   */
  getCategoryTree(): CategoryTree {
    return this.categoryTree;
  }

  /**
   * Search nodes by query string
   */
  searchNodes(query: string): NodeDefinition[] {
    if (!query.trim()) {
      return this.getAllNodes();
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = new Set<NodeDefinition>();

    // Search by name/label
    this.searchIndex.byName.forEach((nodes, name) => {
      if (name.includes(normalizedQuery)) {
        nodes.forEach((node) => results.add(node));
      }
    });

    // Search by description
    this.searchIndex.byDescription.forEach((nodes, description) => {
      if (description.includes(normalizedQuery)) {
        nodes.forEach((node) => results.add(node));
      }
    });

    // Search by tags
    this.searchIndex.byTag.forEach((nodes, tag) => {
      if (tag.includes(normalizedQuery)) {
        nodes.forEach((node) => results.add(node));
      }
    });

    // Search by category
    this.searchIndex.byCategory.forEach((nodes, category) => {
      if (category.includes(normalizedQuery)) {
        nodes.forEach((node) => results.add(node));
      }
    });

    return Array.from(results);
  }

  /**
   * Get nodes by specific tag
   */
  getNodesByTag(tag: string): NodeDefinition[] {
    return this.searchIndex.byTag.get(tag.toLowerCase()) || [];
  }

  /**
   * Get all available tags
   */
  getAllTags(): string[] {
    return Array.from(this.searchIndex.byTag.keys());
  }

  /**
   * Get node metadata for UI display
   */
  getNodeMetadata(type: string): NodeMetadata | undefined {
    const node = this.getNode(type);
    if (!node) return undefined;

    return {
      label: node.metadata?.label || node.type.split('::').pop() || node.type,
      description: node.metadata?.description || 'No description available',
      tags: node.metadata?.tags || [],
      category: node.category,
      subcategory: node.subcategory,
      examples: node.metadata?.examples,
      documentation: node.metadata?.documentation,
    };
  }

  /**
   * Get statistics about the registry
   */
  getStatistics() {
    const categories = this.getCategories();
    const totalSubcategories = categories.reduce((total, cat) => {
      return total + this.getSubcategories(cat).length;
    }, 0);

    return {
      totalNodes: this.getNodeCount(),
      totalCategories: categories.length,
      totalSubcategories,
      totalTags: this.getAllTags().length,
      nodesByCategory: categories.map((cat) => ({
        category: cat,
        count: this.getNodesByCategory(cat).length,
        subcategories: this.getSubcategories(cat).map((subcat) => ({
          subcategory: subcat,
          count: this.getNodesBySubcategory(cat, subcat).length,
        })),
      })),
    };
  }

  /**
   * Update category tree when registering nodes
   */
  private updateCategoryTree(node: NodeDefinition): void {
    const { category, subcategory } = node;

    if (!this.categoryTree[category]) {
      this.categoryTree[category] = {
        nodes: [],
        subcategories: {},
      };
    }

    this.categoryTree[category].nodes.push(node);

    if (subcategory) {
      if (!this.categoryTree[category].subcategories[subcategory]) {
        this.categoryTree[category].subcategories[subcategory] = [];
      }
      this.categoryTree[category].subcategories[subcategory].push(node);
    }
  }

  /**
   * Update search index when registering nodes
   */
  private updateSearchIndex(node: NodeDefinition): void {
    const metadata = this.getNodeMetadata(node.type);
    if (!metadata) return;

    // Index by name/label
    const nameKey = metadata.label.toLowerCase();
    if (!this.searchIndex.byName.has(nameKey)) {
      this.searchIndex.byName.set(nameKey, []);
    }
    this.searchIndex.byName.get(nameKey)!.push(node);

    // Index by type
    const typeKey = node.type.toLowerCase();
    if (!this.searchIndex.byName.has(typeKey)) {
      this.searchIndex.byName.set(typeKey, []);
    }
    this.searchIndex.byName.get(typeKey)!.push(node);

    // Index by description
    const descKey = metadata.description.toLowerCase();
    if (!this.searchIndex.byDescription.has(descKey)) {
      this.searchIndex.byDescription.set(descKey, []);
    }
    this.searchIndex.byDescription.get(descKey)!.push(node);

    // Index by category
    const catKey = metadata.category.toLowerCase();
    if (!this.searchIndex.byCategory.has(catKey)) {
      this.searchIndex.byCategory.set(catKey, []);
    }
    this.searchIndex.byCategory.get(catKey)!.push(node);

    // Index by subcategory
    if (metadata.subcategory) {
      const subcatKey = metadata.subcategory.toLowerCase();
      if (!this.searchIndex.byCategory.has(subcatKey)) {
        this.searchIndex.byCategory.set(subcatKey, []);
      }
      this.searchIndex.byCategory.get(subcatKey)!.push(node);
    }

    // Index by tags
    metadata.tags.forEach((tag) => {
      const tagKey = tag.toLowerCase();
      if (!this.searchIndex.byTag.has(tagKey)) {
        this.searchIndex.byTag.set(tagKey, []);
      }
      this.searchIndex.byTag.get(tagKey)!.push(node);
    });
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.nodes.clear();
    this.categoryTree = {};
    this.searchIndex = {
      byName: new Map(),
      byTag: new Map(),
      byCategory: new Map(),
      byDescription: new Map(),
    };
  }
}

export default EnhancedNodeRegistry;
