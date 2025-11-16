/**
 * Collaboration End-to-End Tests
 * Tests for real-time collaborative editing workflows
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const STUDIO_URL = 'http://localhost:5173';
const COLLABORATION_TIMEOUT = 10000;

// Helper functions
async function createNewProject(page: Page, projectName: string) {
  await page.goto(STUDIO_URL);
  await page.click('[data-testid="new-project-button"]');
  await page.fill('[data-testid="project-name-input"]', projectName);
  await page.click('[data-testid="create-project-button"]');
  await page.waitForSelector('[data-testid="node-editor"]');
}

async function joinCollaborativeSession(page: Page, sessionId: string, userName: string) {
  await page.goto(`${STUDIO_URL}/session/${sessionId}`);
  await page.fill('[data-testid="user-name-input"]', userName);
  await page.click('[data-testid="join-session-button"]');
  await page.waitForSelector('[data-testid="collaboration-status"][data-status="connected"]');
}

async function createNode(page: Page, nodeType: string, x: number, y: number) {
  // Right-click to open context menu
  await page.click('[data-testid="node-editor"]', {
    button: 'right',
    position: { x, y },
  });

  // Select node type from menu
  await page.click(`[data-testid="node-menu-${nodeType}"]`);

  // Wait for node to be created
  await page.waitForSelector(`[data-node-type="${nodeType}"]`);
}

async function selectNode(page: Page, nodeId: string) {
  await page.click(`[data-node-id="${nodeId}"]`);
  await page.waitForSelector(`[data-node-id="${nodeId}"][data-selected="true"]`);
}

async function updateNodeParameter(page: Page, nodeId: string, paramName: string, value: string) {
  await selectNode(page, nodeId);
  await page.fill(`[data-param="${paramName}"] input`, value);
  await page.press(`[data-param="${paramName}"] input`, 'Enter');
}

test.describe('Collaborative Editing', () => {
  let context1: BrowserContext;
  let context2: BrowserContext;
  let user1: Page;
  let user2: Page;

  test.beforeEach(async ({ browser }) => {
    // Create two separate browser contexts for two users
    context1 = await browser.newContext();
    context2 = await browser.newContext();
    user1 = await context1.newPage();
    user2 = await context2.newPage();
  });

  test.afterEach(async () => {
    await context1.close();
    await context2.close();
  });

  test('should enable real-time collaborative node creation', async () => {
    // User 1 creates a project and starts collaboration
    await createNewProject(user1, 'Collaboration Test');
    await user1.click('[data-testid="start-collaboration-button"]');

    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    expect(sessionId).toBeTruthy();

    // User 2 joins the session
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // Verify both users see each other in the user list
    await expect(
      user1.locator('[data-testid="user-list"] [data-user-name="User Two"]')
    ).toBeVisible();
    await expect(
      user2.locator('[data-testid="user-list"] [data-user-name="User One"]')
    ).toBeVisible();

    // User 1 creates a node
    await createNode(user1, 'Math::Add', 200, 150);

    // User 2 should see the node appear in real-time
    await expect(user2.locator('[data-node-type="Math::Add"]')).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });

    // User 2 creates a node
    await createNode(user2, 'Math::Multiply', 400, 150);

    // User 1 should see the new node
    await expect(user1.locator('[data-node-type="Math::Multiply"]')).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });
  });

  test('should synchronize parameter changes', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Parameter Sync Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // User 1 creates a node with parameters
    await createNode(user1, 'Math::Add', 200, 150);
    const nodeId = await user1.getAttribute('[data-node-type="Math::Add"]', 'data-node-id');

    // User 1 updates a parameter
    await updateNodeParameter(user1, nodeId!, 'a', '5');

    // User 2 should see the parameter update
    await expect(user2.locator(`[data-node-id="${nodeId}"] [data-param="a"] input`)).toHaveValue(
      '5',
      {
        timeout: COLLABORATION_TIMEOUT,
      }
    );

    // User 2 updates a different parameter
    await updateNodeParameter(user2, nodeId!, 'b', '3');

    // User 1 should see the parameter update
    await expect(user1.locator(`[data-node-id="${nodeId}"] [data-param="b"] input`)).toHaveValue(
      '3',
      {
        timeout: COLLABORATION_TIMEOUT,
      }
    );
  });

  test('should handle parameter conflicts with last-writer-wins', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Conflict Resolution Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // Create a node
    await createNode(user1, 'Math::Add', 200, 150);
    const nodeId = await user1.getAttribute('[data-node-type="Math::Add"]', 'data-node-id');

    // Both users update the same parameter simultaneously
    await Promise.all([
      updateNodeParameter(user1, nodeId!, 'a', '10'),
      updateNodeParameter(user2, nodeId!, 'a', '20'),
    ]);

    // Wait for conflict resolution
    await user1.waitForTimeout(1000);

    // Both users should see the same value (last writer wins)
    const value1 = await user1.inputValue(`[data-node-id="${nodeId}"] [data-param="a"] input`);
    const value2 = await user2.inputValue(`[data-node-id="${nodeId}"] [data-param="a"] input`);
    expect(value1).toBe(value2);
  });

  test('should show real-time cursor tracking', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Cursor Tracking Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // User 1 moves mouse over the editor
    await user1.hover('[data-testid="node-editor"]', { position: { x: 300, y: 200 } });

    // User 2 should see User 1's cursor
    await expect(user2.locator('[data-testid="user-cursor"][data-user="User One"]')).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });

    // User 2 moves mouse
    await user2.hover('[data-testid="node-editor"]', { position: { x: 500, y: 300 } });

    // User 1 should see User 2's cursor
    await expect(user1.locator('[data-testid="user-cursor"][data-user="User Two"]')).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });
  });

  test('should show selection highlights', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Selection Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // Create nodes
    await createNode(user1, 'Math::Add', 200, 150);
    const nodeId = await user1.getAttribute('[data-node-type="Math::Add"]', 'data-node-id');

    // User 1 selects the node
    await selectNode(user1, nodeId!);

    // User 2 should see the selection highlight
    await expect(
      user2.locator(
        `[data-testid="selection-highlight"][data-node-id="${nodeId}"][data-user="User One"]`
      )
    ).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });

    // User 2 selects the same node
    await selectNode(user2, nodeId!);

    // User 1 should see User 2's selection
    await expect(
      user1.locator(
        `[data-testid="selection-highlight"][data-node-id="${nodeId}"][data-user="User Two"]`
      )
    ).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });
  });

  test('should handle user joining and leaving', async () => {
    // User 1 creates project
    await createNewProject(user1, 'User Management Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');

    // User 2 joins
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // Both users should see each other
    await expect(
      user1.locator('[data-testid="user-list"] [data-user-name="User Two"]')
    ).toBeVisible();
    await expect(
      user2.locator('[data-testid="user-list"] [data-user-name="User One"]')
    ).toBeVisible();

    // User 2 leaves (closes browser)
    await user2.close();

    // User 1 should see User 2 go offline
    await expect(
      user1.locator('[data-testid="user-list"] [data-user-name="User Two"][data-status="offline"]')
    ).toBeVisible({
      timeout: COLLABORATION_TIMEOUT,
    });
  });

  test('should persist operations across disconnections', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Persistence Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // User 1 creates multiple nodes
    await createNode(user1, 'Math::Add', 200, 150);
    await createNode(user1, 'Math::Multiply', 400, 150);

    // User 2 disconnects and reconnects
    await user2.reload();
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // User 2 should see all previously created nodes
    await expect(user2.locator('[data-node-type="Math::Add"]')).toBeVisible();
    await expect(user2.locator('[data-node-type="Math::Multiply"]')).toBeVisible();
  });

  test('should handle concurrent node deletion', async () => {
    // Set up collaborative session
    await createNewProject(user1, 'Deletion Test');
    await user1.click('[data-testid="start-collaboration-button"]');
    const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
    await joinCollaborativeSession(user2, sessionId!, 'User Two');

    // Create a node
    await createNode(user1, 'Math::Add', 200, 150);
    const nodeId = await user1.getAttribute('[data-node-type="Math::Add"]', 'data-node-id');

    // Both users try to delete the same node simultaneously
    await Promise.all([
      user1.press(`[data-node-id="${nodeId}"]`, 'Delete'),
      user2.press(`[data-node-id="${nodeId}"]`, 'Delete'),
    ]);

    // Wait for operation processing
    await user1.waitForTimeout(1000);

    // Node should be deleted and both users should see the deletion
    await expect(user1.locator(`[data-node-id="${nodeId}"]`)).not.toBeVisible();
    await expect(user2.locator(`[data-node-id="${nodeId}"]`)).not.toBeVisible();
  });
});

test.describe('Collaboration Performance', () => {
  test('should handle multiple rapid operations', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const user1 = await context1.newPage();
    const user2 = await context2.newPage();

    try {
      // Set up session
      await createNewProject(user1, 'Performance Test');
      await user1.click('[data-testid="start-collaboration-button"]');
      const sessionId = await user1.getAttribute('[data-testid="session-id"]', 'data-session-id');
      await joinCollaborativeSession(user2, sessionId!, 'User Two');

      // Create many nodes rapidly
      const nodeCreationPromises = [];
      for (let i = 0; i < 10; i++) {
        nodeCreationPromises.push(createNode(user1, 'Math::Add', 100 + i * 50, 150));
      }

      await Promise.all(nodeCreationPromises);

      // User 2 should see all nodes
      await expect(user2.locator('[data-node-type="Math::Add"]')).toHaveCount(10, {
        timeout: COLLABORATION_TIMEOUT * 2,
      });
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should maintain performance with many users', async ({ browser }) => {
    const contexts: BrowserContext[] = [];
    const users: Page[] = [];
    const userCount = 5;

    try {
      // Create multiple browser contexts
      for (let i = 0; i < userCount; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        users.push(page);
      }

      // User 0 creates project
      await createNewProject(users[0], 'Multi-User Test');
      await users[0].click('[data-testid="start-collaboration-button"]');
      const sessionId = await users[0].getAttribute(
        '[data-testid="session-id"]',
        'data-session-id'
      );

      // All other users join
      for (let i = 1; i < userCount; i++) {
        await joinCollaborativeSession(users[i], sessionId!, `User ${i + 1}`);
      }

      // Each user creates a node
      for (let i = 0; i < userCount; i++) {
        await createNode(users[i], 'Math::Add', 100 + i * 100, 150);
      }

      // All users should see all nodes
      for (let i = 0; i < userCount; i++) {
        await expect(users[i].locator('[data-node-type="Math::Add"]')).toHaveCount(userCount, {
          timeout: COLLABORATION_TIMEOUT * 2,
        });
      }
    } finally {
      for (const context of contexts) {
        await context.close();
      }
    }
  });
});
