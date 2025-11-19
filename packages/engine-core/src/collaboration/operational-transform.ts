/**
 * Operational Transform Engine
 * Implementation of operational transformation for collaborative editing
 */

import {
  Operation,
  OperationConflict,
  ConflictResolution,
  NodeId,
  EdgeId,
  CreateNodeOperation,
  DeleteNodeOperation,
  UpdateNodePositionOperation,
  UpdateNodeParamsOperation,
  CreateEdgeOperation,
  DeleteEdgeOperation,
  BatchOperation,
} from './types';

export type ConflictResolutionStrategy =
  | 'merge'
  | 'last-writer-wins'
  | 'first-writer-wins'
  | 'user-decision';

export class OperationalTransformEngine {
  /**
   * Transform a local operation against a remote operation
   */
  async transform(localOp: Operation, remoteOp: Operation): Promise<Operation> {
    // If operations are on different entities, no transformation needed
    if (!this.doOperationsConflict(localOp, remoteOp)) {
      return localOp;
    }

    // Handle batch operations
    if (localOp.type === 'BATCH' && remoteOp.type === 'BATCH') {
      return this.transformBatchVsBatch(localOp as BatchOperation, remoteOp as BatchOperation);
    }

    if (localOp.type === 'BATCH') {
      return this.transformBatchVsOperation(localOp as BatchOperation, remoteOp);
    }

    if (remoteOp.type === 'BATCH') {
      return this.transformOperationVsBatch(localOp, remoteOp as BatchOperation);
    }

    // Transform based on operation types
    const key = `${localOp.type}_vs_${remoteOp.type}`;

    switch (key) {
      case 'CREATE_NODE_vs_CREATE_NODE':
        return this.transformCreateNodeVsCreateNode(
          localOp as CreateNodeOperation,
          remoteOp as CreateNodeOperation
        );

      case 'CREATE_NODE_vs_DELETE_NODE':
        return this.transformCreateNodeVsDeleteNode(
          localOp as CreateNodeOperation,
          remoteOp as DeleteNodeOperation
        );

      case 'DELETE_NODE_vs_CREATE_NODE':
        return this.transformDeleteNodeVsCreateNode(
          localOp as DeleteNodeOperation,
          remoteOp as CreateNodeOperation
        );

      case 'DELETE_NODE_vs_DELETE_NODE':
        return this.transformDeleteNodeVsDeleteNode(
          localOp as DeleteNodeOperation,
          remoteOp as DeleteNodeOperation
        );

      case 'UPDATE_NODE_POSITION_vs_UPDATE_NODE_POSITION':
        return this.transformUpdatePositionVsUpdatePosition(
          localOp as UpdateNodePositionOperation,
          remoteOp as UpdateNodePositionOperation
        );

      case 'UPDATE_NODE_POSITION_vs_DELETE_NODE':
        return this.transformUpdatePositionVsDeleteNode(
          localOp as UpdateNodePositionOperation,
          remoteOp as DeleteNodeOperation
        );

      case 'UPDATE_NODE_PARAMS_vs_UPDATE_NODE_PARAMS':
        return this.transformUpdateParamsVsUpdateParams(
          localOp as UpdateNodeParamsOperation,
          remoteOp as UpdateNodeParamsOperation
        );

      case 'UPDATE_NODE_PARAMS_vs_DELETE_NODE':
        return this.transformUpdateParamsVsDeleteNode(
          localOp as UpdateNodeParamsOperation,
          remoteOp as DeleteNodeOperation
        );

      case 'CREATE_EDGE_vs_CREATE_EDGE':
        return this.transformCreateEdgeVsCreateEdge(
          localOp as CreateEdgeOperation,
          remoteOp as CreateEdgeOperation
        );

      case 'CREATE_EDGE_vs_DELETE_NODE':
        return this.transformCreateEdgeVsDeleteNode(
          localOp as CreateEdgeOperation,
          remoteOp as DeleteNodeOperation
        );

      case 'DELETE_EDGE_vs_DELETE_EDGE':
        return this.transformDeleteEdgeVsDeleteEdge(
          localOp as DeleteEdgeOperation,
          remoteOp as DeleteEdgeOperation
        );

      case 'DELETE_EDGE_vs_DELETE_NODE':
        return this.transformDeleteEdgeVsDeleteNode(
          localOp as DeleteEdgeOperation,
          remoteOp as DeleteNodeOperation
        );

      default:
        // No transformation needed for non-conflicting operations
        return localOp;
    }
  }

  /**
   * Detect conflicts between operations
   */
  detectConflict(op1: Operation, op2: Operation): OperationConflict | null {
    if (!this.doOperationsConflict(op1, op2)) {
      return null;
    }

    const conflictType = this.getConflictType(op1, op2);
    const conflictingFields = this.getConflictingFields(op1, op2);

    return {
      type: conflictType,
      localOperation: op1,
      remoteOperation: op2,
      conflictingFields,
    } as unknown;
  }

  /**
   * Resolve conflicts based on strategy
   */
  async resolveConflict(
    conflict: OperationConflict,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution> {
    const { localOperation, remoteOperation } = conflict;

    switch (strategy) {
      case 'merge':
        return this.mergeOperations(localOperation, remoteOperation);

      case 'last-writer-wins':
        return this.lastWriterWinsResolution(localOperation, remoteOperation);

      case 'first-writer-wins':
        return this.firstWriterWinsResolution(localOperation, remoteOperation);

      case 'user-decision':
        return this.userDecisionResolution(localOperation, remoteOperation);

      default:
        throw new Error(`Unknown conflict resolution strategy: ${strategy}`);
    }
  }

  // Private transformation methods

  private doOperationsConflict(op1: Operation, op2: Operation): boolean {
    // Special handling for batch operations
    if (op1.type === 'BATCH') {
      const batchOp = op1 as BatchOperation;
      return batchOp.operations.some((subOp) => this.doOperationsConflict(subOp, op2));
    }

    if (op2.type === 'BATCH') {
      const batchOp = op2 as BatchOperation;
      return batchOp.operations.some((subOp) => this.doOperationsConflict(op1, subOp));
    }

    // Special cases for edge operations
    if (op1.type === 'CREATE_EDGE' && op2.type === 'DELETE_NODE') {
      const edgeOp = op1 as CreateEdgeOperation;
      const deleteOp = op2 as DeleteNodeOperation;
      return edgeOp.sourceNodeId === deleteOp.nodeId || edgeOp.targetNodeId === deleteOp.nodeId;
    }

    if (op2.type === 'CREATE_EDGE' && op1.type === 'DELETE_NODE') {
      const edgeOp = op2 as CreateEdgeOperation;
      const deleteOp = op1 as DeleteNodeOperation;
      return edgeOp.sourceNodeId === deleteOp.nodeId || edgeOp.targetNodeId === deleteOp.nodeId;
    }

    // Special cases for CREATE_NODE vs DELETE_NODE
    if (op1.type === 'CREATE_NODE' && op2.type === 'DELETE_NODE') {
      const createOp = op1 as CreateNodeOperation;
      const deleteOp = op2 as DeleteNodeOperation;
      return createOp.nodeId === deleteOp.nodeId;
    }

    if (op2.type === 'CREATE_NODE' && op1.type === 'DELETE_NODE') {
      const createOp = op2 as CreateNodeOperation;
      const deleteOp = op1 as DeleteNodeOperation;
      return createOp.nodeId === deleteOp.nodeId;
    }

    // Operations conflict if they operate on the same entity
    const entity1 = this.getOperationEntity(op1);
    const entity2 = this.getOperationEntity(op2);

    return entity1 === entity2;
  }

  private getOperationEntity(op: Operation): string {
    switch (op.type) {
      case 'CREATE_NODE':
      case 'DELETE_NODE':
      case 'UPDATE_NODE_POSITION':
      case 'UPDATE_NODE_PARAMS':
        return `node:${(op as unknown).nodeId}`;

      case 'CREATE_EDGE':
      case 'DELETE_EDGE':
        return `edge:${(op as unknown).edgeId}`;

      case 'BATCH': {
        // For batch operations, get entities from all sub-operations
        const entities = (op as BatchOperation).operations.map((subOp) =>
          this.getOperationEntity(subOp)
        );
        return entities.join(',');
      }

      default:
        return 'unknown';
    }
  }

  private transformCreateNodeVsCreateNode(
    localOp: CreateNodeOperation,
    remoteOp: CreateNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Same node ID, generate conflict-avoided ID
      return {
        ...localOp,
        nodeId: `${localOp.nodeId}_conflict_${Date.now()}`,
      };
    }
    return localOp;
  }

  private transformCreateNodeVsDeleteNode(
    localOp: CreateNodeOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Cannot create a node that's being deleted
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformDeleteNodeVsCreateNode(
    localOp: DeleteNodeOperation,
    remoteOp: CreateNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Node is being created, so delete is not needed
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformDeleteNodeVsDeleteNode(
    localOp: DeleteNodeOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Node already deleted, no need to delete again
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformUpdatePositionVsUpdatePosition(
    localOp: UpdateNodePositionOperation,
    remoteOp: UpdateNodePositionOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Both updating position, remote wins (last writer wins)
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformUpdatePositionVsDeleteNode(
    localOp: UpdateNodePositionOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Cannot update position of deleted node
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformUpdateParamsVsUpdateParams(
    localOp: UpdateNodeParamsOperation,
    remoteOp: UpdateNodeParamsOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Check for conflicting parameters
      const conflictingParams = Object.keys(localOp.paramUpdates).filter(
        (key) => key in remoteOp.paramUpdates
      );

      if (conflictingParams.length === 0) {
        // No conflicts, keep local operation
        return localOp;
      }

      // Merge parameter updates, removing conflicted ones (remote wins for conflicts)
      const mergedParams = { ...localOp.paramUpdates };
      for (const key of conflictingParams) {
        delete mergedParams[key];
      }

      if (Object.keys(mergedParams).length === 0) {
        const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
        return noop;
      }

      return {
        ...localOp,
        paramUpdates: mergedParams,
      };
    }
    return localOp;
  }

  private transformUpdateParamsVsDeleteNode(
    localOp: UpdateNodeParamsOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    if (localOp.nodeId === remoteOp.nodeId) {
      // Cannot update parameters of deleted node
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformCreateEdgeVsCreateEdge(
    localOp: CreateEdgeOperation,
    remoteOp: CreateEdgeOperation
  ): Operation {
    if (localOp.edgeId === remoteOp.edgeId) {
      // Same edge ID, remote wins
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformCreateEdgeVsDeleteNode(
    localOp: CreateEdgeOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    if (localOp.sourceNodeId === remoteOp.nodeId || localOp.targetNodeId === remoteOp.nodeId) {
      // Cannot create edge to/from deleted node
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformDeleteEdgeVsDeleteEdge(
    localOp: DeleteEdgeOperation,
    remoteOp: DeleteEdgeOperation
  ): Operation {
    if (localOp.edgeId === remoteOp.edgeId) {
      // Edge already deleted
      const noop: Operation = { ...localOp, type: 'NOOP' as unknown };
      return noop;
    }
    return localOp;
  }

  private transformDeleteEdgeVsDeleteNode(
    localOp: DeleteEdgeOperation,
    remoteOp: DeleteNodeOperation
  ): Operation {
    // Edge deletion is still valid even if node is deleted
    // (node deletion should cascade to edge deletion)
    return localOp;
  }

  private async transformBatchVsBatch(
    localOp: BatchOperation,
    remoteOp: BatchOperation
  ): Promise<Operation> {
    // Transform each operation in the batch
    const transformedOps: Operation[] = [];

    for (const localSubOp of localOp.operations) {
      let transformedSubOp = localSubOp;

      for (const remoteSubOp of remoteOp.operations) {
        transformedSubOp = await this.transform(transformedSubOp, remoteSubOp);
      }

      // Only include non-NOOP operations
      if (transformedSubOp.type !== 'NOOP') {
        transformedOps.push(transformedSubOp);
      }
    }

    return {
      ...localOp,
      operations: transformedOps,
    };
  }

  private async transformBatchVsOperation(
    localOp: BatchOperation,
    remoteOp: Operation
  ): Promise<Operation> {
    const transformedOps: Operation[] = [];

    for (const subOp of localOp.operations) {
      const transformedSubOp = await this.transform(subOp, remoteOp);
      // Only include non-NOOP operations
      if (transformedSubOp.type !== 'NOOP') {
        transformedOps.push(transformedSubOp);
      }
    }

    return {
      ...localOp,
      operations: transformedOps,
    };
  }

  private async transformOperationVsBatch(
    localOp: Operation,
    remoteOp: BatchOperation
  ): Promise<Operation> {
    let transformedOp = localOp;

    for (const remoteSubOp of remoteOp.operations) {
      transformedOp = await this.transform(transformedOp, remoteSubOp);
    }

    return transformedOp;
  }

  // Conflict resolution methods

  private getConflictType(op1: Operation, op2: Operation): string {
    // Check for specific conflict types
    if (op1.type === 'CREATE_NODE' && op2.type === 'CREATE_NODE') {
      const createOp1 = op1 as CreateNodeOperation;
      const createOp2 = op2 as CreateNodeOperation;
      if (createOp1.nodeId === createOp2.nodeId) {
        return 'NODE_ID_CONFLICT';
      }
    }

    if (op1.type === 'UPDATE_NODE_PARAMS' && op2.type === 'UPDATE_NODE_PARAMS') {
      const updateOp1 = op1 as UpdateNodeParamsOperation;
      const updateOp2 = op2 as UpdateNodeParamsOperation;
      if (updateOp1.nodeId === updateOp2.nodeId) {
        const conflictingParams = Object.keys(updateOp1.paramUpdates).filter(
          (key) => key in updateOp2.paramUpdates
        );
        if (conflictingParams.length > 0) {
          return 'PARAMETER_CONFLICT';
        }
      }
    }

    return `${op1.type}_vs_${op2.type}`;
  }

  private getConflictingFields(op1: Operation, op2: Operation): string[] {
    if (op1.type === 'UPDATE_NODE_PARAMS' && op2.type === 'UPDATE_NODE_PARAMS') {
      const updateOp1 = op1 as UpdateNodeParamsOperation;
      const updateOp2 = op2 as UpdateNodeParamsOperation;
      if (updateOp1.nodeId === updateOp2.nodeId) {
        return Object.keys(updateOp1.paramUpdates).filter((key) => key in updateOp2.paramUpdates);
      }
    }
    return [];
  }

  private getConflictSeverity(op1: Operation, op2: Operation): 'low' | 'medium' | 'high' {
    // High severity for destructive operations
    if (op1.type === 'DELETE_NODE' || op2.type === 'DELETE_NODE') {
      return 'high';
    }

    // Medium severity for structural changes
    if (
      op1.type === 'CREATE_EDGE' ||
      op2.type === 'CREATE_EDGE' ||
      op1.type === 'DELETE_EDGE' ||
      op2.type === 'DELETE_EDGE'
    ) {
      return 'medium';
    }

    // Low severity for parameter/position updates
    return 'low';
  }

  private getConflictDescription(op1: Operation, op2: Operation): string {
    const entity1 = this.getOperationEntity(op1);
    const entity2 = this.getOperationEntity(op2);

    return `Concurrent ${op1.type} and ${op2.type} operations on ${entity1}`;
  }

  private async mergeOperations(
    localOp: Operation,
    remoteOp: Operation
  ): Promise<ConflictResolution> {
    // For parameter conflicts, merge the parameters
    if (localOp.type === 'UPDATE_NODE_PARAMS' && remoteOp.type === 'UPDATE_NODE_PARAMS') {
      const localParams = (localOp as UpdateNodeParamsOperation).paramUpdates;
      const remoteParams = (remoteOp as UpdateNodeParamsOperation).paramUpdates;

      const mergedParams = { ...localParams, ...remoteParams };

      const resolvedOperation: UpdateNodeParamsOperation = {
        ...(localOp as UpdateNodeParamsOperation),
        paramUpdates: mergedParams,
      };

      return {
        strategy: 'merge',
        resolvedOperation,
        metadata: {
          originalLocal: localOp,
          originalRemote: remoteOp,
          mergeStrategy: 'parameter_merge',
        },
      };
    }

    // Default merge: transform local against remote
    const resolvedOperation = await this.transform(localOp, remoteOp);

    return {
      strategy: 'merge',
      resolvedOperation,
      metadata: {
        originalLocal: localOp,
        originalRemote: remoteOp,
        mergeStrategy: 'operational_transform',
      },
    };
  }

  private async lastWriterWinsResolution(
    localOp: Operation,
    remoteOp: Operation
  ): Promise<ConflictResolution> {
    const winner = (remoteOp.timestamp || 0) > (localOp.timestamp || 0) ? remoteOp : localOp;

    return {
      strategy: 'last-writer-wins',
      resolvedOperation: winner,
      metadata: {
        winner: winner === localOp ? 'local' : 'remote',
        originalLocal: localOp,
        originalRemote: remoteOp,
      },
    };
  }

  private async firstWriterWinsResolution(
    localOp: Operation,
    remoteOp: Operation
  ): Promise<ConflictResolution> {
    const winner = (localOp.timestamp || 0) < (remoteOp.timestamp || 0) ? localOp : remoteOp;

    return {
      strategy: 'first-writer-wins',
      resolvedOperation: winner,
      metadata: {
        winner: winner === localOp ? 'local' : 'remote',
        originalLocal: localOp,
        originalRemote: remoteOp,
      },
    };
  }

  private async userDecisionResolution(
    localOp: Operation,
    remoteOp: Operation
  ): Promise<ConflictResolution> {
    // In a real implementation, this would trigger UI for user decision
    // For now, default to local operation
    return {
      strategy: 'user-decision',
      resolvedOperation: localOp,
      metadata: {
        decision: 'local',
        originalLocal: localOp,
        originalRemote: remoteOp,
        requiresUserInput: true,
      },
    };
  }
}
