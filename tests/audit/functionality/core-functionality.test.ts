import { expect, test } from '@playwright/test';
import {
  bootstrapStudio,
  clearAuditErrors,
  ensureCanvasReady,
  getAuditErrors,
} from '../utils/studio-helpers';

test.describe('Studio Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapStudio(page);
    await clearAuditErrors(page);
  });

  test('renders primary layout panels', async ({ page }) => {
    const canvas = await ensureCanvasReady(page, 10000);
    expect(canvas).not.toBeNull();

    const palette = page.locator('.enhanced-node-palette');
    const inspector = page.locator('.inspector');

    await expect(palette.first()).toBeVisible();
    await expect(inspector.first()).toBeVisible();
    expect(await getAuditErrors(page)).toEqual([]);
  });

  test('creates nodes via studio API and reflects on canvas', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).studio?.clearGraph?.();
      (window as any).studio?.createNode?.('Solid::Box', { x: 240, y: 200 });
      (window as any).studio?.createNode?.('Solid::Cylinder', { x: 420, y: 260 });
    });

    const nodes = page.locator('.react-flow__node');
    await expect(nodes).toHaveCount(2);
    expect(await getAuditErrors(page)).toEqual([]);
  });

  test('undo and redo reverse node creation', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).studio?.clearGraph?.();
      (window as any).studio?.createNode?.('Solid::Box', { x: 160, y: 160 });
    });

    await page.evaluate(() => (window as any).studio?.undo?.());
    await expect(page.locator('.react-flow__node')).toHaveCount(0);

    await page.evaluate(() => (window as any).studio?.redo?.());
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
    expect(await getAuditErrors(page)).toEqual([]);
  });

  test('node palette search filters available nodes', async ({ page }) => {
    const searchInput = page.locator('.node-search-bar .search-input').first();
    await expect(searchInput).toBeVisible();

    await searchInput.fill('box');
    await page.waitForTimeout(300);

    const visibleCards = await page
      .locator('.nodes-container [data-node-type], .nodes-container .node-card')
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const style = window.getComputedStyle(element as HTMLElement);
            return style.display !== 'none' && style.visibility !== 'hidden';
          })
          .map((element) => (element as HTMLElement).innerText.toLowerCase())
      );

    expect(visibleCards.length).toBeGreaterThan(0);
    for (const label of visibleCards) {
      expect(label).toContain('box');
    }

    await searchInput.fill('');
    await page.waitForTimeout(200);
    expect(await getAuditErrors(page)).toEqual([]);
  });
});
