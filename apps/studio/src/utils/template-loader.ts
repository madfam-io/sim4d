/**
 * Template Loader Utility
 *
 * Handles loading .bflow.json template files and importing them into the graph state.
 * Provides analytics tracking for template usage and validation.
 */

import type { Graph } from '@brepflow/types';
import { createChildLogger } from '../lib/logging/logger-instance';
import type { Template } from '../templates/template-registry';

const logger = createChildLogger({ module: 'TemplateLoader' });

export interface TemplateLoadOptions {
  /**
   * Whether to clear the existing graph before loading template
   * @default true
   */
  clearExisting?: boolean;

  /**
   * Position offset for placing template nodes
   * @default { x: 100, y: 100 }
   */
  positionOffset?: { x: number; y: number };

  /**
   * Whether to track analytics event
   * @default true
   */
  trackAnalytics?: boolean;
}

export interface TemplateLoadResult {
  success: boolean;
  graph?: Graph;
  error?: string;
  nodeCount?: number;
  edgeCount?: number;
}

/**
 * Fetch template .bflow.json file from the examples directory
 */
export async function fetchTemplate(graphPath: string): Promise<Graph> {
  try {
    const response = await fetch(graphPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const graph = await response.json();

    // Validate basic structure
    if (!graph.version || !graph.nodes || !Array.isArray(graph.nodes)) {
      throw new Error('Invalid template format: missing version or nodes');
    }

    logger.debug('Template fetched successfully', {
      graphPath,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges?.length || 0,
      version: graph.version,
    });

    return graph;
  } catch (error) {
    logger.error('Failed to fetch template', {
      graphPath,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Validate template graph structure
 */
export function validateTemplate(graph: Graph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!graph.version) {
    errors.push('Missing version field');
  }

  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    errors.push('Missing or invalid nodes array');
  }

  if (!graph.units) {
    errors.push('Missing units field');
  }

  // Validate nodes
  if (graph.nodes) {
    graph.nodes.forEach((node: unknown, index: number) => {
      if (!node.id) {
        errors.push(`Node ${index} missing id`);
      }
      if (!node.type) {
        errors.push(`Node ${index} (${node.id}) missing type`);
      }
    });
  }

  // Validate edges
  if (graph.edges) {
    graph.edges.forEach((edge: unknown, index: number) => {
      if (!edge.source || !edge.target) {
        errors.push(`Edge ${index} missing source or target`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load template into graph state
 *
 * This function handles the complete template loading workflow:
 * 1. Fetch template file
 * 2. Validate structure
 * 3. Apply position offset if needed
 * 4. Track analytics
 * 5. Return graph ready for import
 *
 * @example
 * ```typescript
 * const result = await loadTemplate(template, {
 *   clearExisting: true,
 *   positionOffset: { x: 100, y: 100 }
 * });
 *
 * if (result.success && result.graph) {
 *   importGraph(result.graph);
 * }
 * ```
 */
export async function loadTemplate(
  template: Template,
  options: TemplateLoadOptions = {}
): Promise<TemplateLoadResult> {
  const {
    clearExisting = true,
    positionOffset = { x: 100, y: 100 },
    trackAnalytics = true,
  } = options;

  try {
    logger.debug('Loading template', {
      templateId: template.id,
      templateName: template.name,
      options,
    });

    // Fetch template graph
    const graph = await fetchTemplate(template.graphPath);

    // Validate structure
    const validation = validateTemplate(graph);
    if (!validation.valid) {
      logger.error('Template validation failed', {
        templateId: template.id,
        errors: validation.errors,
      });
      return {
        success: false,
        error: `Template validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Apply position offset to all nodes
    const offsetGraph: Graph = {
      ...graph,
      nodes: graph.nodes.map((node: unknown) => ({
        ...node,
        position: {
          x: (node.position?.x || 0) + positionOffset.x,
          y: (node.position?.y || 0) + positionOffset.y,
        },
      })),
    };

    // Track analytics if enabled
    if (trackAnalytics) {
      trackTemplateLoad(template);
    }

    logger.info('Template loaded successfully', {
      templateId: template.id,
      templateName: template.name,
      nodeCount: offsetGraph.nodes.length,
      edgeCount: offsetGraph.edges?.length || 0,
    });

    return {
      success: true,
      graph: offsetGraph,
      nodeCount: offsetGraph.nodes.length,
      edgeCount: offsetGraph.edges?.length || 0,
    };
  } catch (error) {
    logger.error('Failed to load template', {
      templateId: template.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error loading template',
    };
  }
}

/**
 * Track template load analytics event
 */
function trackTemplateLoad(template: Template): void {
  try {
    // Create analytics event
    const event = {
      type: 'template_loaded',
      timestamp: new Date().toISOString(),
      data: {
        templateId: template.id,
        templateName: template.name,
        difficulty: template.difficulty,
        category: template.category,
        nodeCount: template.nodeCount,
        estimatedTime: template.estimatedTime,
      },
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      logger.debug('Template analytics event', event);
    }

    // Store in localStorage for analytics dashboard
    const existingEvents = localStorage.getItem('brepflow_template_events');
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);

    // Keep last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('brepflow_template_events', JSON.stringify(events));

    logger.debug('Template load tracked', {
      templateId: template.id,
      eventCount: events.length,
    });
  } catch (error) {
    logger.warn('Failed to track template analytics', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Get template loading analytics summary
 */
export function getTemplateAnalytics(): {
  totalLoads: number;
  templateUsage: Record<string, number>;
  recentLoads: Array<{ templateId: string; templateName: string; timestamp: string }>;
} {
  try {
    const existingEvents = localStorage.getItem('brepflow_template_events');
    const events = existingEvents ? JSON.parse(existingEvents) : [];

    const templateUsage: Record<string, number> = {};
    const recentLoads: Array<{ templateId: string; templateName: string; timestamp: string }> = [];

    events.forEach(
      (event: { data: { templateId: string; templateName: string }; timestamp: string }) => {
        const templateId = event.data.templateId;
        templateUsage[templateId] = (templateUsage[templateId] || 0) + 1;
        recentLoads.push({
          templateId,
          templateName: event.data.templateName,
          timestamp: event.timestamp,
        });
      }
    );

    // Sort recent loads by timestamp, most recent first
    recentLoads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalLoads: events.length,
      templateUsage,
      recentLoads: recentLoads.slice(0, 10), // Last 10 loads
    };
  } catch (error) {
    logger.warn('Failed to get template analytics', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      totalLoads: 0,
      templateUsage: {},
      recentLoads: [],
    };
  }
}
