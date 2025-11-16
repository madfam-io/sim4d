// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server as HTTPServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';

import { CollaborationServer } from '../../packages/collaboration/src/server/collaboration-server.ts';
import { CollaborationClient } from '../../packages/collaboration/src/client/collaboration-client.ts';
import type { Conflict, Operation, User } from '../../packages/collaboration/src/types.ts';

interface TestClientContext {
  client: CollaborationClient;
  user: User;
}

async function waitFor(condition: () => boolean, timeoutMs = 4000, intervalMs = 50): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return;
    await wait(intervalMs);
  }
  throw new Error('Timed out waiting for condition');
}

describe('Collaboration server/client integration', () => {
  let httpServer: HTTPServer;
  let collaborationServer: CollaborationServer;
  let serverUrl: string;

  const activeClients: TestClientContext[] = [];

  let serverReady = false;
  let skipReason = '';

  beforeAll(async () => {
    httpServer = createServer();
    collaborationServer = new CollaborationServer(httpServer, {
      maxConnectionsPerDocument: 8,
      operationHistoryLimit: 256,
      presenceTimeout: 2000,
      corsOrigin: 'http://127.0.0.1', // Required for security validation
    });

    try {
      await new Promise<void>((resolve, reject) => {
        httpServer.once('error', reject);
        httpServer.listen(0, '127.0.0.1', () => {
          httpServer.off('error', reject);
          resolve();
        });
      });
    } catch (error) {
      skipReason =
        error instanceof Error ? error.message : 'Failed to bind local collaboration test server';
      return;
    }

    const address = httpServer.address();
    if (address && typeof address === 'object') {
      serverUrl = `http://127.0.0.1:${address.port}`;
      serverReady = true;
    } else {
      throw new Error('Unable to determine test server address');
    }
  }, 20_000);

  afterAll(async () => {
    for (const context of activeClients) {
      context.client.destroy();
    }
    activeClients.length = 0;

    if (serverReady) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
      await wait(20); // allow Socket.IO to finish tear-down
    }
  });

  async function createTestClient(
    name: string,
    color: string,
    documentId: string
  ): Promise<TestClientContext> {
    const user: User = {
      id: `user-${name.toLowerCase()}`,
      name,
      color,
    };

    const client = new CollaborationClient({
      serverUrl,
      documentId,
      user,
      autoConnect: false,
      presenceThrottle: 0,
      operationBuffer: 0,
    });

    await new Promise<void>((resolve, reject) => {
      client.setEventHandlers({
        onConnect: () => resolve(),
        onError: (error) => reject(error),
      });
      client.connect();
    });

    activeClients.push({ client, user });
    return { client, user };
  }

  it('syncs operations and presence between collaborators', async () => {
    if (!serverReady) {
      console.warn(
        '[collaboration.integration] Skipping test:',
        skipReason || 'Collaboration server failed to start (likely sandboxed network)'
      );
      return;
    }

    const documentId = `doc-${randomUUID()}`;

    const alice = await createTestClient('Alice', '#ff3366', documentId);
    const bob = await createTestClient('Bob', '#3366ff', documentId);

    // Wait for initial document sync from server for both clients
    await waitFor(() => Boolean(alice.client.getDocument()));
    await waitFor(() => Boolean(bob.client.getDocument()));

    const addNodeOperation: Operation = {
      id: `op-${Date.now()}`,
      type: 'ADD_NODE',
      userId: alice.user.id,
      timestamp: Date.now(),
      documentId,
      node: {
        id: `node-${Date.now()}`,
        type: 'Solid::Box',
        position: { x: 160, y: 80 },
        inputs: {},
        params: {
          width: 40,
          height: 20,
          depth: 30,
        },
        dirty: false,
      },
    };

    alice.client.submitOperation(addNodeOperation);

    await waitFor(() => (alice.client.getDocument()?.graph.nodes.length ?? 0) === 1);
    await waitFor(() => (bob.client.getDocument()?.graph.nodes.length ?? 0) === 1);

    const aliceDoc = alice.client.getDocument();
    const bobDoc = bob.client.getDocument();
    expect(aliceDoc?.version).toBeGreaterThan(0);
    expect(bobDoc?.version).toBe(aliceDoc?.version);

    // Presence propagation from Bob to Alice
    bob.client.updateCursor({ userId: bob.user.id, x: 320, y: 180 });
    bob.client.updateSelection({ userId: bob.user.id, nodeIds: ['node-selection'], edgeIds: [] });

    await waitFor(() => {
      const presence = alice.client.getPresence();
      const bobPresence = presence.find((entry) => entry.user.id === bob.user.id);
      return Boolean(bobPresence?.cursor) && bobPresence?.cursor?.x === 320;
    });

    const presenceForBob = alice.client.getUserPresence(bob.user.id);
    expect(presenceForBob).toBeDefined();
    expect(presenceForBob?.cursor).toMatchObject({ x: 320, y: 180 });

    // Bob should also observe his own presence locally for mirror-checking
    const bobPresenceList = bob.client.getPresence();
    expect(bobPresenceList.some((entry) => entry.user.id === bob.user.id)).toBe(true);
  }, 60_000);

  it('emits conflict events when collaborators concurrently edit the same node', async () => {
    if (!serverReady) {
      console.warn(
        '[collaboration.integration] Skipping test:',
        skipReason || 'Collaboration server failed to start (likely sandboxed network)'
      );
      return;
    }

    const documentId = `doc-${randomUUID()}`;

    const alice = await createTestClient('Alice', '#ff3366', documentId);
    const bob = await createTestClient('Bob', '#3366ff', documentId);

    await waitFor(() => Boolean(alice.client.getDocument()));
    await waitFor(() => Boolean(bob.client.getDocument()));

    const nodeId = `node-${Date.now()}`;
    const baseAdd: Operation = {
      id: `op-${Date.now()}-add`,
      type: 'ADD_NODE',
      userId: alice.user.id,
      timestamp: Date.now(),
      documentId,
      node: {
        id: nodeId,
        type: 'Solid::Box',
        position: { x: 120, y: 100 },
        inputs: {},
        params: { width: 60, height: 40, depth: 30 },
        dirty: false,
      },
    };

    alice.client.submitOperation(baseAdd);

    await waitFor(() => (alice.client.getDocument()?.graph.nodes.length ?? 0) === 1);
    await waitFor(() => (bob.client.getDocument()?.graph.nodes.length ?? 0) === 1);

    const conflicts: Conflict[] = [];
    bob.client.setEventHandlers({
      onConflict: (conflict) => {
        conflicts.push(conflict);
      },
      onError: (error) => {
        throw error;
      },
    });

    const aliceUpdate: Operation = {
      id: `op-${Date.now()}-alice-update`,
      type: 'UPDATE_NODE',
      userId: alice.user.id,
      timestamp: Date.now(),
      documentId,
      nodeId,
      updates: {
        params: {
          width: 85,
        },
      },
    };

    const bobUpdate: Operation = {
      id: `op-${Date.now()}-bob-update`,
      type: 'UPDATE_NODE',
      userId: bob.user.id,
      timestamp: Date.now(),
      documentId,
      nodeId,
      updates: {
        params: {
          height: 55,
        },
      },
    };

    alice.client.submitOperation(aliceUpdate);
    await waitFor(() => (alice.client.getDocument()?.operations.length ?? 0) >= 2);
    bob.client.submitOperation(bobUpdate);

    await waitFor(() => conflicts.length > 0);
    const conflict = conflicts[0];
    expect(conflict.operation1.nodeId).toBe(nodeId);
    expect(conflict.operation2.nodeId).toBe(nodeId);

    await waitFor(() => {
      const aliceNode = alice.client.getDocument()?.graph.nodes.find((node) => node.id === nodeId);
      const bobNode = bob.client.getDocument()?.graph.nodes.find((node) => node.id === nodeId);
      return Boolean(aliceNode?.params) && Boolean(bobNode?.params);
    });

    const aliceNode = alice.client.getDocument()?.graph.nodes.find((node) => node.id === nodeId);
    const bobNode = bob.client.getDocument()?.graph.nodes.find((node) => node.id === nodeId);
    expect(aliceNode?.params?.width).toBeDefined();
    expect(bobNode?.params?.height).toBeDefined();
  }, 60_000);

  it('re-synchronizes state after a collaborator reconnects', async () => {
    if (!serverReady) {
      console.warn(
        '[collaboration.integration] Skipping test:',
        skipReason || 'Collaboration server failed to start (likely sandboxed network)'
      );
      return;
    }

    const documentId = `doc-${randomUUID()}`;

    const alice = await createTestClient('Alice', '#ff3366', documentId);
    const charlie = await createTestClient('Charlie', '#33aa55', documentId);

    await waitFor(() => Boolean(alice.client.getDocument()));
    await waitFor(() => Boolean(charlie.client.getDocument()));

    const connectionEvents: string[] = [];
    let latestSyncVersion = 0;
    charlie.client.setEventHandlers({
      onDisconnect: () => connectionEvents.push('disconnect'),
      onConnect: () => connectionEvents.push('connect'),
      onDocumentSync: (doc) => {
        latestSyncVersion = doc.version;
      },
      onError: (error) => {
        throw error;
      },
    });

    charlie.client.disconnect();
    await waitFor(() => connectionEvents.includes('disconnect'));

    const nodeId = `node-${Date.now()}`;
    const addWhileOffline: Operation = {
      id: `op-${Date.now()}-offline-add`,
      type: 'ADD_NODE',
      userId: alice.user.id,
      timestamp: Date.now(),
      documentId,
      node: {
        id: nodeId,
        type: 'Solid::Cylinder',
        position: { x: 180, y: 120 },
        inputs: {},
        params: { radius: 15, height: 70 },
        dirty: false,
      },
    };

    alice.client.submitOperation(addWhileOffline);
    await waitFor(
      () => alice.client.getDocument()?.graph.nodes.some((node) => node.id === nodeId) ?? false
    );
    const targetVersion = alice.client.getDocument()?.version ?? 0;

    charlie.client.connect();
    await waitFor(() => connectionEvents.includes('connect'));

    await waitFor(() => latestSyncVersion >= targetVersion, 8000);
    await waitFor(
      () => charlie.client.getDocument()?.graph.nodes.some((node) => node.id === nodeId) ?? false,
      8000
    );

    const charlieDoc = charlie.client.getDocument();
    const aliceDoc = alice.client.getDocument();
    expect(charlieDoc?.graph.nodes.some((node) => node.id === nodeId)).toBe(true);
    expect(charlieDoc?.version).toBe(aliceDoc?.version);
  }, 60_000);
});
