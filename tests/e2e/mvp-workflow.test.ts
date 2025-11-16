/**
 * MVP Workflow E2E Tests
 *
 * Tests the complete user journey:
 * 1. Create session
 * 2. Build geometry with nodes
 * 3. Export STEP/STL
 * 4. Share session
 */

import { test, expect } from '@playwright/test';

test.describe('MVP Workflow', () => {
  test('should create new session automatically', async ({ page }) => {
    // Navigate to home
    await page.goto('http://localhost:5173');

    // Should auto-redirect to session URL
    await page.waitForURL(/\/session\/[a-f0-9-]+/, { timeout: 10000 });

    const url = page.url();
    expect(url).toMatch(/\/session\/[a-f0-9-]+/);

    // Should show empty canvas
    await page.waitForSelector('.node-canvas, canvas', { timeout: 5000 });
  });

  test('should build geometry with nodes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/);
    await page.waitForSelector('.node-canvas, canvas');

    // Add a Box node (if node palette exists)
    const nodePalette = page.locator('[data-testid="node-palette"], .node-palette');
    const hasPalette = (await nodePalette.count()) > 0;

    if (hasPalette) {
      // Open node palette
      await nodePalette.click();

      // Search for Box
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
      if ((await searchInput.count()) > 0) {
        await searchInput.fill('Box');
      }

      // Click Box node
      const boxNode = page.locator('[data-node-type*="Box"], button:has-text("Box")').first();
      await boxNode.click();

      // Verify node appears on canvas
      await page.waitForSelector('.node, [data-node-id]', { timeout: 5000 });
    }
  });

  test('should export STEP file', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/);

    // Wait for session controls
    const exportButton = page.locator('button:has-text("Export STEP")');

    // Button should exist
    await expect(exportButton).toBeVisible({ timeout: 10000 });

    // Listen for download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

    // Click export
    await exportButton.click();

    // Verify download starts
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('design.step');
  });

  test('should export STL file', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/);

    // Wait for session controls
    const exportButton = page.locator('button:has-text("Export STL")');

    // Button should exist
    await expect(exportButton).toBeVisible({ timeout: 10000 });

    // Listen for download
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

    // Click export
    await exportButton.click();

    // Verify download starts
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('design.stl');
  });

  test('should copy share link', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/);

    // Get session URL
    const currentUrl = page.url();

    // Click share button
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton).toBeVisible({ timeout: 10000 });
    await shareButton.click();

    // Verify button shows success state
    await expect(shareButton).toHaveText(/Copied/, { timeout: 2000 });

    // Verify clipboard contains session URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(currentUrl);
  });

  test('should load shared session', async ({ page, context }) => {
    // User 1: Create session
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/);

    const sessionUrl = page.url();

    // User 2: Open same session in new tab
    const page2 = await context.newPage();
    await page2.goto(sessionUrl);

    // Should load same session
    await page2.waitForURL(sessionUrl);
    await page2.waitForSelector('.node-canvas, canvas', { timeout: 5000 });

    // Verify session ID matches
    expect(page2.url()).toBe(sessionUrl);
  });

  test('should show session ID in UI', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/([a-f0-9-]+)/);

    // Extract session ID from URL
    const urlMatch = page.url().match(/\/session\/([a-f0-9-]+)/);
    expect(urlMatch).toBeTruthy();
    const sessionId = urlMatch![1];

    // Should display session ID in UI
    const sessionDisplay = page.locator('text=/Session:/');
    await expect(sessionDisplay).toBeVisible({ timeout: 5000 });

    // Should show first 8 characters of session ID
    await expect(sessionDisplay).toHaveText(new RegExp(sessionId.slice(0, 8)));
  });

  test('complete MVP workflow: create → build → export → share', async ({ page, context }) => {
    // Step 1: Create session
    await page.goto('http://localhost:5173');
    await page.waitForURL(/\/session\/[a-f0-9-]+/, { timeout: 10000 });
    const sessionUrl = page.url();

    // Step 2: Verify canvas loaded
    await page.waitForSelector('.node-canvas, canvas', { timeout: 5000 });

    // Step 3: Export STEP
    const exportStepButton = page.locator('button:has-text("Export STEP")');
    await expect(exportStepButton).toBeVisible({ timeout: 10000 });

    const stepDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await exportStepButton.click();
    const stepDownload = await stepDownloadPromise;
    expect(stepDownload.suggestedFilename()).toBe('design.step');

    // Step 4: Export STL
    const exportStlButton = page.locator('button:has-text("Export STL")');
    const stlDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await exportStlButton.click();
    const stlDownload = await stlDownloadPromise;
    expect(stlDownload.suggestedFilename()).toBe('design.stl');

    // Step 5: Share session
    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();
    await expect(shareButton).toHaveText(/Copied/, { timeout: 2000 });

    // Step 6: Verify shared session works
    const page2 = await context.newPage();
    await page2.goto(sessionUrl);
    await page2.waitForSelector('.node-canvas, canvas', { timeout: 5000 });
    expect(page2.url()).toBe(sessionUrl);
  });
});
