import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CloudSyncConfig } from './cloud-sync-manager';
import { CloudSyncManager } from './cloud-sync-manager';
import type { GraphInstance } from '@sim4d/types';

const baselineGraph: GraphInstance = {
  version: '0.1.0',
  units: 'mm',
  tolerance: 0.001,
  nodes: [
    {
      id: 'node-1',
      type: 'Test::Node',
      inputs: {},
      outputs: { value: 1 },
      params: { foo: 'bar' },
    },
    {
      id: 'node-2',
      type: 'Test::Node',
      inputs: {},
      outputs: { value: 2 },
      params: { foo: 'baz' },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'node-1',
      sourceHandle: 'out',
      target: 'node-2',
      targetHandle: 'in',
    },
  ],
};

const versionVector = {
  deviceId: 'server',
  timestamp: 0,
  operationId: 'initial',
  parentVersions: [],
  checksum: '',
};

const config: CloudSyncConfig = {
  apiEndpoint: 'https://example.com',
  apiKey: 'test',
  deviceId: 'device-1',
  userId: 'user-1',
  syncInterval: 60_000,
  maxRetries: 2,
  batchSize: 50,
  compressionEnabled: false,
  conflictResolution: 'latest-wins',
  requestTimeout: 5_000,
};

const createApiMock = () => ({
  getProjectVersion: vi.fn(async () => versionVector),
  getProjectState: vi.fn(async () => ({
    operations: [],
    version: versionVector,
    metadata: { id: 'proj-1' },
  })),
  getSyncDelta: vi.fn(async () => ({
    operations: [],
    versionVector,
    conflicts: [],
    size: 0,
    compressed: false,
  })),
  sendOperations: vi.fn(async () => {}),
});

describe('CloudSyncManager', () => {
  beforeEach(() => {
    process.env.BREPFLOW_ENABLE_CLOUD_SYNC = 'true';
  });

  it('initializes projects and stores graph snapshots', async () => {
    const api = createApiMock();
    const manager = new CloudSyncManager(config, api as any);

    await manager.initializeProject('project-1', baselineGraph);

    expect(api.getProjectVersion).toHaveBeenCalledWith('project-1');
    expect(api.getProjectState).toHaveBeenCalledWith('project-1');

    const storedGraph = (manager as any).lastGraphs.get('project-1');
    expect(storedGraph).toBeDefined();
    expect(storedGraph).not.toBe(baselineGraph);
    expect(storedGraph.nodes).toEqual(baselineGraph.nodes);
  });

  it('produces granular operations when graph changes', () => {
    const api = createApiMock();
    const manager = new CloudSyncManager(config, api as any);
    const projectId = 'project-ops';

    (manager as any).lastGraphs.set(projectId, JSON.parse(JSON.stringify(baselineGraph)));

    const modifiedGraph: GraphInstance = {
      ...baselineGraph,
      units: 'cm',
      nodes: [
        baselineGraph.nodes[0],
        {
          ...baselineGraph.nodes[1],
          params: { foo: 'updated' },
        },
        {
          id: 'node-3',
          type: 'Test::Node',
          inputs: {},
          outputs: { value: 3 },
          params: { foo: 'new' },
        },
      ],
      edges: [
        baselineGraph.edges[0],
        {
          id: 'edge-2',
          source: 'node-2',
          sourceHandle: 'out',
          target: 'node-3',
          targetHandle: 'in',
        },
      ],
    };

    const operations = (manager as any).generateOperationsFromGraph(projectId, modifiedGraph);
    const types = operations.map((op: any) => op.type);

    expect(types).toEqual(
      expect.arrayContaining(['UPDATE_NODE', 'ADD_NODE', 'ADD_EDGE', 'UPDATE_GRAPH_SETTINGS'])
    );

    const storedGraph = (manager as any).lastGraphs.get(projectId);
    expect(storedGraph).toBeDefined();
    expect(storedGraph.nodes).toEqual(modifiedGraph.nodes);

    const repeat = (manager as any).generateOperationsFromGraph(projectId, modifiedGraph);
    expect(repeat).toHaveLength(0);
  });

  it('cleans project state on cleanup', () => {
    const api = createApiMock();
    const manager = new CloudSyncManager(config, api as any);

    (manager as any).syncStates.set('cleanup', {});
    (manager as any).operationQueues.set('cleanup', []);
    (manager as any).lastGraphs.set('cleanup', baselineGraph);

    manager.cleanup('cleanup');

    expect((manager as any).syncStates.has('cleanup')).toBe(false);
    expect((manager as any).operationQueues.has('cleanup')).toBe(false);
    expect((manager as any).lastGraphs.has('cleanup')).toBe(false);
  });
});
