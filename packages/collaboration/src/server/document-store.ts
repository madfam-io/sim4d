import type { Document, Operation, Graph } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentStoreOptions {
  operationHistoryLimit?: number;
}

export class DocumentStore {
  private documents: Map<string, Document> = new Map();
  private operationHistoryLimit: number;

  constructor(options?: DocumentStoreOptions) {
    this.operationHistoryLimit = options?.operationHistoryLimit ?? 1000;
  }

  async createDocument(id: string, initialGraph?: Graph): Promise<Document> {
    const document: Document = {
      id,
      graph: initialGraph ?? this.createEmptyGraph(),
      version: 0,
      operations: [],
      sessions: [],
    };

    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async applyOperation(documentId: string, operation: Operation): Promise<Document> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Apply operation to graph
    this.applyOperationToGraph(document.graph, operation);

    // Add to operation history
    document.operations.push(operation);

    // Trim history if needed
    if (document.operations.length > this.operationHistoryLimit) {
      document.operations = document.operations.slice(-this.operationHistoryLimit);
    }

    // Increment version
    document.version++;

    return document;
  }

  private applyOperationToGraph(graph: Graph, operation: Operation): void {
    switch (operation.type) {
      case 'ADD_NODE':
        graph.nodes.push(operation.node);
        break;

      case 'DELETE_NODE':
        graph.nodes = graph.nodes.filter((n) => n.id !== operation.nodeId);
        // Also remove connected edges
        graph.edges = graph.edges.filter(
          (e) => e.source !== operation.nodeId && e.target !== operation.nodeId
        );
        break;

      case 'UPDATE_NODE':
        const nodeIndex = graph.nodes.findIndex((n) => n.id === operation.nodeId);
        if (nodeIndex >= 0) {
          graph.nodes[nodeIndex] = {
            ...graph.nodes[nodeIndex],
            ...operation.updates,
          };
        }
        break;

      case 'ADD_EDGE':
        graph.edges.push(operation.edge);
        break;

      case 'DELETE_EDGE':
        graph.edges = graph.edges.filter((e) => e.id !== operation.edgeId);
        break;

      case 'UPDATE_GRAPH_METADATA':
        graph.metadata = {
          ...graph.metadata,
          ...operation.metadata,
        };
        break;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    return ids
      .map((id) => this.documents.get(id))
      .filter((doc): doc is Document => doc !== undefined);
  }

  private createEmptyGraph(): Graph {
    return {
      version: '0.1.0',
      units: 'mm',
      tolerance: 0.001,
      nodes: [],
      edges: [],
      metadata: {
        name: 'Untitled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  clear(): void {
    this.documents.clear();
  }
}
