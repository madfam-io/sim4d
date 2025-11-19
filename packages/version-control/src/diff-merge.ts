/**
 * Semantic Diff and Merge Algorithms for CAD Models
 * Graph-aware diffing and three-way merge with conflict detection
 */

import type {
  Graph,
  Node,
  Edge,
  SemanticDiff,
  GraphDelta,
  MergeResult,
  MergeConflict,
  NodeDiff,
  ParameterDiff,
  GeometryDiff,
  ConflictResolution,
  ValidationError,
} from './types';
import { createHash } from 'crypto';

export class SemanticDiffer {
  /**
   * Compute semantic diff between two graph states
   */
  computeDiff(from: Graph, to: Graph): SemanticDiff {
    const nodeChanges = this.diffNodes(from, to);
    const paramChanges = this.diffParameters(from, to, nodeChanges.modified);
    const topologyChanges = this.diffTopology(from, to);
    const geometryChanges = this.diffGeometry(from, to);

    return {
      commits: {
        from: from.commitId || '',
        to: to.commitId || '',
      },

      nodes: nodeChanges,
      parameters: paramChanges,
      topology: topologyChanges,
      geometry: geometryChanges,

      summary: this.generateSummary(nodeChanges, paramChanges, topologyChanges, geometryChanges),
    };
  }

  private diffNodes(
    from: Graph,
    to: Graph
  ): {
    added: NodeDiff[];
    modified: NodeDiff[];
    deleted: NodeDiff[];
  } {
    const fromNodes = new Map(from.nodes.map((n) => [n.id, n]));
    const toNodes = new Map(to.nodes.map((n) => [n.id, n]));

    const added: NodeDiff[] = [];
    const modified: NodeDiff[] = [];
    const deleted: NodeDiff[] = [];

    // Find added and modified nodes
    for (const [id, node] of toNodes) {
      const oldNode = fromNodes.get(id);

      if (!oldNode) {
        // Added node
        added.push({
          nodeId: id,
          nodeType: node.type,
          after: node,
          changes: {},
          impact: this.analyzeImpact(to, id),
        });
      } else if (this.nodeChanged(oldNode, node)) {
        // Modified node
        const changes = this.analyzeNodeChanges(oldNode, node, from, to);
        modified.push({
          nodeId: id,
          nodeType: node.type,
          before: oldNode,
          after: node,
          changes,
          impact: this.analyzeImpact(to, id),
        });
      }
    }

    // Find deleted nodes
    for (const [id, node] of fromNodes) {
      if (!toNodes.has(id)) {
        deleted.push({
          nodeId: id,
          nodeType: node.type,
          before: node,
          changes: {},
          impact: {
            downstreamNodes: [],
            geometryChanged: true,
            breakingChange: true,
          },
        });
      }
    }

    return { added, modified, deleted };
  }

  private nodeChanged(a: Node, b: Node): boolean {
    // Check if node has changed (params, position, etc.)
    return (
      JSON.stringify(a.params) !== JSON.stringify(b.params) ||
      JSON.stringify(a.position) !== JSON.stringify(b.position)
    );
  }

  private analyzeNodeChanges(
    before: Node,
    after: Node,
    fromGraph: Graph,
    toGraph: Graph
  ): NodeDiff['changes'] {
    const changes: NodeDiff['changes'] = {};

    // Parameter changes
    const paramDiffs: ParameterDiff[] = [];
    for (const key in after.params) {
      if (before.params[key] !== after.params[key]) {
        paramDiffs.push({
          nodeId: after.id,
          parameter: key,
          before: before.params[key],
          after: after.params[key],
          absoluteChange: this.computeAbsoluteChange(before.params[key], after.params[key]),
          percentChange: this.computePercentChange(before.params[key], after.params[key]),
          visualType: this.getVisualType(key),
        });
      }
    }
    if (paramDiffs.length > 0) {
      changes.parameters = paramDiffs;
    }

    // Position changes
    if (JSON.stringify(before.position) !== JSON.stringify(after.position)) {
      changes.position = {
        before: before.position,
        after: after.position,
      };
    }

    // Connection changes
    const beforeConnections = this.getNodeConnections(fromGraph, before.id);
    const afterConnections = this.getNodeConnections(toGraph, after.id);

    const added = afterConnections.filter((c) => !beforeConnections.includes(c));
    const removed = beforeConnections.filter((c) => !afterConnections.includes(c));

    if (added.length > 0 || removed.length > 0) {
      changes.connections = { added, removed };
    }

    return changes;
  }

  private diffParameters(from: Graph, to: Graph, modifiedNodes: NodeDiff[]): ParameterDiff[] {
    const allParamDiffs: ParameterDiff[] = [];

    for (const nodeDiff of modifiedNodes) {
      if (nodeDiff.changes.parameters) {
        allParamDiffs.push(...nodeDiff.changes.parameters);
      }
    }

    return allParamDiffs;
  }

  private diffTopology(from: Graph, to: Graph): SemanticDiff['topology'] {
    const fromEdges = new Set(from.edges.map((e) => this.edgeKey(e)));
    const toEdges = new Set(to.edges.map((e) => this.edgeKey(e)));

    const edgesAdded = to.edges.filter((e) => !fromEdges.has(this.edgeKey(e)));
    const edgesRemoved = from.edges.filter((e) => !toEdges.has(this.edgeKey(e)));

    return {
      edgesAdded,
      edgesRemoved,
      connectivityChanged: edgesAdded.length > 0 || edgesRemoved.length > 0,
    };
  }

  private diffGeometry(from: Graph, to: Graph): GeometryDiff {
    // Compute geometry statistics
    // In real implementation, would analyze actual geometry
    return {
      volumeChange: 0,
      surfaceAreaChange: 0,
      boundingBoxChange: {
        before: { min: [0, 0, 0], max: [100, 100, 100] },
        after: { min: [0, 0, 0], max: [120, 100, 100] },
      },
      addedFaces: 0,
      removedFaces: 0,
      modifiedFaces: 0,
    };
  }

  private generateSummary(
    nodes: { added: NodeDiff[]; modified: NodeDiff[]; deleted: NodeDiff[] },
    params: ParameterDiff[],
    topology: SemanticDiff['topology'],
    geometry: GeometryDiff
  ): SemanticDiff['summary'] {
    const changes: string[] = [];

    if (nodes.added.length > 0) {
      changes.push(`Added ${nodes.added.length} nodes`);
    }
    if (nodes.modified.length > 0) {
      changes.push(`Modified ${nodes.modified.length} nodes`);
    }
    if (nodes.deleted.length > 0) {
      changes.push(`Deleted ${nodes.deleted.length} nodes`);
    }
    if (params.length > 0) {
      changes.push(`Changed ${params.length} parameters`);
    }

    return {
      title: this.generateTitle(nodes, params),
      description: changes.join(', '),
      changes,
      statistics: {
        nodesAdded: nodes.added.length,
        nodesModified: nodes.modified.length,
        nodesDeleted: nodes.deleted.length,
        parametersChanged: params.length,
        geometryImpact: this.assessGeometryImpact(geometry),
      },
      breakingChanges: this.findBreakingChanges(nodes),
      improvements: this.findImprovements(params),
    };
  }

  private generateTitle(
    nodes: { added: NodeDiff[]; modified: NodeDiff[]; deleted: NodeDiff[] },
    params: ParameterDiff[]
  ): string {
    if (nodes.added.length > 0) {
      return `Add ${nodes.added[0].nodeType}`;
    }
    if (params.length > 0) {
      return `Update ${params[0].parameter} on ${params[0].nodeId}`;
    }
    if (nodes.deleted.length > 0) {
      return `Remove ${nodes.deleted[0].nodeType}`;
    }
    return 'Update graph';
  }

  private assessGeometryImpact(geo: GeometryDiff): 'none' | 'minor' | 'major' {
    const volumeChangePercent = Math.abs(geo.volumeChange) * 100;
    if (volumeChangePercent < 1) return 'none';
    if (volumeChangePercent < 10) return 'minor';
    return 'major';
  }

  private findBreakingChanges(nodes: {
    added: NodeDiff[];
    modified: NodeDiff[];
    deleted: NodeDiff[];
  }): string[] {
    const breaking: string[] = [];
    for (const node of nodes.deleted) {
      breaking.push(`Deleted ${node.nodeType} '${node.nodeId}'`);
    }
    return breaking;
  }

  private findImprovements(params: ParameterDiff[]): string[] {
    const improvements: string[] = [];
    // Analyze parameter changes for improvements
    return improvements;
  }

  private analyzeImpact(graph: Graph, nodeId: string): NodeDiff['impact'] {
    const downstream = this.getDownstreamNodes(graph, nodeId);
    return {
      downstreamNodes: downstream,
      geometryChanged: true, // Would check actual geometry
      breakingChange: false,
    };
  }

  private getNodeConnections(graph: Graph, nodeId: string): string[] {
    return graph.edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => (e.source === nodeId ? e.target : e.source));
  }

  private getDownstreamNodes(graph: Graph, nodeId: string): string[] {
    const downstream: Set<string> = new Set();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const edges = graph.edges.filter((e) => e.source === current);

      for (const edge of edges) {
        if (!downstream.has(edge.target)) {
          downstream.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    return Array.from(downstream);
  }

  private edgeKey(edge: Edge): string {
    return `${edge.source}:${edge.sourcePort}->${edge.target}:${edge.targetPort}`;
  }

  private computeAbsoluteChange(before: unknown, after: unknown): number | undefined {
    if (typeof before === 'number' && typeof after === 'number') {
      return after - before;
    }
    return undefined;
  }

  private computePercentChange(before: unknown, after: unknown): number | undefined {
    if (typeof before === 'number' && typeof after === 'number' && before !== 0) {
      return ((after - before) / before) * 100;
    }
    return undefined;
  }

  private getVisualType(param: string): ParameterDiff['visualType'] {
    if (param.includes('angle') || param.includes('rotation')) return 'angle';
    if (param.includes('count') || param.includes('number')) return 'count';
    if (param.includes('enable') || param.includes('visible')) return 'boolean';
    if (param.includes('type') || param.includes('mode')) return 'selection';
    return 'dimension';
  }
}

export class CADMerger {
  private differ = new SemanticDiffer();

  /**
   * Three-way merge for CAD graphs
   */
  merge(base: Graph, ours: Graph, theirs: Graph): MergeResult {
    // Compute diffs
    const ourChanges = this.computeGraphDelta(base, ours);
    const theirChanges = this.computeGraphDelta(base, theirs);

    // Find conflicts
    const conflicts = this.detectConflicts(ourChanges, theirChanges);

    // Auto-merge non-conflicting changes
    const autoMerged = this.autoMerge(base, ourChanges, theirChanges, conflicts);

    // Build result graph
    const resultGraph = this.applyDelta(base, autoMerged);

    // Validate result
    const validation = this.validateGraph(resultGraph);

    return {
      success: conflicts.length === 0 && validation.valid,
      conflicts,
      autoMerged,
      geometryValid: validation.geometryValid,
      validationErrors: validation.errors,
    };
  }

  private computeGraphDelta(from: Graph, to: Graph): GraphDelta {
    const diff = this.differ.computeDiff(from, to);

    return {
      addedNodes: diff.nodes.added.map((n) => ({
        nodeId: n.nodeId,
        nodeType: n.nodeType,
        after: n.after,
        geometryChanged: true,
        affectedNodes: n.impact.downstreamNodes,
      })),

      modifiedNodes: diff.nodes.modified.map((n) => ({
        nodeId: n.nodeId,
        nodeType: n.nodeType,
        before: n.before,
        after: n.after,
        geometryChanged: n.impact.geometryChanged,
        affectedNodes: n.impact.downstreamNodes,
      })),

      deletedNodes: diff.nodes.deleted.map((n) => n.nodeId),

      addedEdges: diff.topology.edgesAdded.map((e) => ({
        edgeId: e.id,
        source: e.source,
        target: e.target,
        sourcePort: e.sourcePort,
        targetPort: e.targetPort,
      })),

      deletedEdges: diff.topology.edgesRemoved.map((e) => e.id),

      parameterChanges: diff.parameters,

      operations: [], // Would track actual operations
    };
  }

  private detectConflicts(ours: GraphDelta, theirs: GraphDelta): MergeConflict[] {
    const conflicts: MergeConflict[] = [];

    // Parameter conflicts
    for (const ourParam of ours.parameterChanges) {
      const theirParam = theirs.parameterChanges.find(
        (p) => p.nodeId === ourParam.nodeId && p.parameter === ourParam.parameter
      );

      if (theirParam && ourParam.after !== theirParam.after) {
        conflicts.push({
          type: 'parameter',
          nodeId: ourParam.nodeId,
          parameter: ourParam.parameter,
          base: ourParam.before,
          ours: ourParam.after,
          theirs: theirParam.after,
          severity: this.assessConflictSeverity('parameter', ourParam),
          description: `Parameter ${ourParam.parameter} on ${ourParam.nodeId} has conflicting values`,
          suggestions: this.suggestResolutions(ourParam, theirParam),
        });
      }
    }

    // Node modification conflicts
    for (const ourNode of ours.modifiedNodes) {
      const theirNode = theirs.modifiedNodes.find((n) => n.nodeId === ourNode.nodeId);

      if (theirNode) {
        const ourDeleted = ours.deletedNodes.includes(ourNode.nodeId);
        const theirDeleted = theirs.deletedNodes.includes(ourNode.nodeId);

        if (ourDeleted || theirDeleted) {
          conflicts.push({
            type: 'node',
            nodeId: ourNode.nodeId,
            base: ourNode.before,
            ours: ourDeleted ? null : ourNode.after,
            theirs: theirDeleted ? null : theirNode.after,
            severity: 'high',
            description: `Node ${ourNode.nodeId} deleted in one branch but modified in another`,
          });
        }
      }
    }

    // Topology conflicts
    const ourEdgeSet = new Set(ours.addedEdges.map((e) => `${e.source}->${e.target}`));
    const theirEdgeSet = new Set(theirs.addedEdges.map((e) => `${e.source}->${e.target}`));

    for (const edge of ours.deletedEdges) {
      if (theirEdgeSet.has(edge)) {
        conflicts.push({
          type: 'edge',
          base: edge,
          ours: null,
          theirs: edge,
          severity: 'medium',
          description: `Edge ${edge} deleted in our branch but exists in theirs`,
        });
      }
    }

    return conflicts;
  }

  private autoMerge(
    base: Graph,
    ours: GraphDelta,
    theirs: GraphDelta,
    conflicts: MergeConflict[]
  ): GraphDelta {
    // Get conflicting node IDs
    const conflictNodeIds = new Set(conflicts.map((c) => c.nodeId).filter(Boolean));

    // Merge non-conflicting additions
    const addedNodes = [
      ...ours.addedNodes.filter((n) => !conflictNodeIds.has(n.nodeId)),
      ...theirs.addedNodes.filter(
        (n) =>
          !conflictNodeIds.has(n.nodeId) && !ours.addedNodes.some((on) => on.nodeId === n.nodeId)
      ),
    ];

    // Merge non-conflicting modifications
    const modifiedNodes = [
      ...ours.modifiedNodes.filter((n) => !conflictNodeIds.has(n.nodeId)),
      ...theirs.modifiedNodes.filter(
        (n) =>
          !conflictNodeIds.has(n.nodeId) && !ours.modifiedNodes.some((on) => on.nodeId === n.nodeId)
      ),
    ];

    // Merge deletions (union)
    const deletedNodes = Array.from(new Set([...ours.deletedNodes, ...theirs.deletedNodes]));

    // Merge edge changes
    const addedEdges = [
      ...ours.addedEdges,
      ...theirs.addedEdges.filter(
        (e) => !ours.addedEdges.some((oe) => oe.source === e.source && oe.target === e.target)
      ),
    ];

    const deletedEdges = Array.from(new Set([...ours.deletedEdges, ...theirs.deletedEdges]));

    // Merge parameter changes (excluding conflicts)
    const conflictParams = new Set(
      conflicts.filter((c) => c.type === 'parameter').map((c) => `${c.nodeId}:${c.parameter}`)
    );

    const parameterChanges = [
      ...ours.parameterChanges.filter((p) => !conflictParams.has(`${p.nodeId}:${p.parameter}`)),
      ...theirs.parameterChanges.filter(
        (p) =>
          !conflictParams.has(`${p.nodeId}:${p.parameter}`) &&
          !ours.parameterChanges.some(
            (op) => op.nodeId === p.nodeId && op.parameter === p.parameter
          )
      ),
    ];

    return {
      addedNodes,
      modifiedNodes,
      deletedNodes,
      addedEdges,
      deletedEdges,
      parameterChanges,
      operations: [],
    };
  }

  private suggestResolutions(
    ourParam: ParameterDiff,
    theirParam: ParameterDiff
  ): ConflictResolution[] {
    const suggestions: ConflictResolution[] = [
      {
        strategy: 'use-ours',
        description: `Use our value: ${ourParam.after}`,
        value: ourParam.after,
        confidence: 0.5,
      },
      {
        strategy: 'use-theirs',
        description: `Use their value: ${theirParam.after}`,
        value: theirParam.after,
        confidence: 0.5,
      },
    ];

    // For numeric values, suggest average
    if (typeof ourParam.after === 'number' && typeof theirParam.after === 'number') {
      const average = (ourParam.after + theirParam.after) / 2;
      suggestions.push({
        strategy: 'merge',
        description: `Use average: ${average}`,
        value: average,
        confidence: 0.7,
      });

      // For dimensions, prefer larger (conservative)
      if (ourParam.visualType === 'dimension') {
        const larger = Math.max(ourParam.after, theirParam.after);
        suggestions.push({
          strategy: 'merge',
          description: `Use larger (conservative): ${larger}`,
          value: larger,
          confidence: 0.8,
        });
      }
    }

    return suggestions;
  }

  private applyDelta(base: Graph, delta: GraphDelta): Graph {
    const result = JSON.parse(JSON.stringify(base)); // Deep clone

    // Apply additions
    for (const node of delta.addedNodes) {
      if (node.after) {
        result.nodes.push(node.after);
      }
    }

    // Apply modifications
    for (const mod of delta.modifiedNodes) {
      const index = result.nodes.findIndex((n) => n.id === mod.nodeId);
      if (index >= 0 && mod.after) {
        result.nodes[index] = mod.after;
      }
    }

    // Apply deletions
    for (const nodeId of delta.deletedNodes) {
      const index = result.nodes.findIndex((n) => n.id === nodeId);
      if (index >= 0) {
        result.nodes.splice(index, 1);
      }
    }

    // Apply edge changes
    for (const edge of delta.addedEdges) {
      result.edges.push({
        id: edge.edgeId,
        source: edge.source,
        target: edge.target,
        sourcePort: edge.sourcePort,
        targetPort: edge.targetPort,
      });
    }

    for (const edgeId of delta.deletedEdges) {
      const index = result.edges.findIndex((e) => e.id === edgeId);
      if (index >= 0) {
        result.edges.splice(index, 1);
      }
    }

    // Apply parameter changes
    for (const param of delta.parameterChanges) {
      const node = result.nodes.find((n) => n.id === param.nodeId);
      if (node) {
        node.params[param.parameter] = param.after;
      }
    }

    return result;
  }

  private validateGraph(graph: Graph): {
    valid: boolean;
    geometryValid: boolean;
    errors: ValidationError[];
  } {
    const errors: ValidationError[] = [];

    // Check for broken references
    for (const edge of graph.edges) {
      const sourceExists = graph.nodes.some((n) => n.id === edge.source);
      const targetExists = graph.nodes.some((n) => n.id === edge.target);

      if (!sourceExists || !targetExists) {
        errors.push({
          type: 'broken-reference',
          message: `Edge ${edge.id} references non-existent node`,
          severity: 'error',
        });
      }
    }

    // Check for cycles
    if (this.hasCycle(graph)) {
      errors.push({
        type: 'cyclic-dependency',
        message: 'Graph contains cyclic dependencies',
        severity: 'error',
      });
    }

    // Check for missing inputs
    for (const node of graph.nodes) {
      const requiredInputs = this.getRequiredInputs(node);
      const connectedInputs = graph.edges
        .filter((e) => e.target === node.id)
        .map((e) => e.targetPort);

      for (const required of requiredInputs) {
        if (!connectedInputs.includes(required)) {
          errors.push({
            type: 'missing-input',
            nodeId: node.id,
            message: `Node ${node.id} missing required input ${required}`,
            severity: 'warning',
          });
        }
      }
    }

    return {
      valid: errors.filter((e) => e.severity === 'error').length === 0,
      geometryValid: true, // Would validate actual geometry
      errors,
    };
  }

  private assessConflictSeverity(
    type: MergeConflict['type'],
    param?: ParameterDiff
  ): MergeConflict['severity'] {
    if (type === 'node' || type === 'topology') return 'high';
    if (type === 'geometry') return 'critical';

    if (type === 'parameter' && param) {
      // Critical parameters
      if (param.parameter === 'tolerance' || param.parameter === 'material') return 'high';

      // Visual-only parameters
      if (param.parameter === 'color' || param.parameter === 'visible') return 'low';
    }

    return 'medium';
  }

  private hasCycle(graph: Graph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.edges.filter((e) => e.source === nodeId).map((e) => e.target);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }

    return false;
  }

  private getRequiredInputs(node: Node): string[] {
    // Would look up node definition to find required inputs
    return [];
  }
}
