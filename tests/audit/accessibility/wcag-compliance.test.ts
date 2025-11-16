import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  bootstrapStudio,
  clearAuditErrors,
  ensureCanvasReady,
  getAuditErrors,
} from '../utils/studio-helpers';

test.describe('WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await bootstrapStudio(page);
    await clearAuditErrors(page);
  });

  test('Homepage has no WCAG A/AA violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.react-flow__minimap')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Node editor surface passes WCAG checks', async ({ page }) => {
    const canvas = await ensureCanvasReady(page, 15000);
    test.skip(!canvas, 'React Flow canvas not available');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.react-flow__minimap')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Viewport container respects accessibility guidance', async ({ page }) => {
    const canvasLocator = page.locator('canvas');
    await canvasLocator
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => null);
    test.skip(!(await canvasLocator.count()), '3D viewport canvas not rendered');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('canvas')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Inspector panel exposes accessible controls', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).studio?.createNode?.('Solid::Box', { x: 160, y: 160 });
    });

    const inspector = page.locator('.inspector');
    await inspector.first().waitFor({ state: 'visible', timeout: 5000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('.inspector')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Node palette provides accessible browsing', async ({ page }) => {
    const palette = page.locator('.enhanced-node-palette');
    await palette.first().waitFor({ state: 'visible', timeout: 5000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('.enhanced-node-palette')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Global color contrast meets WCAG AA thresholds', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    expect(results.violations).toEqual([]);
  });

  test('Keyboard focus indicators are visible', async ({ page }) => {
    await page.keyboard.press('Tab');

    const hasIndicator = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element || element === document.body) return false;
      const styles = window.getComputedStyle(element);
      const outlineVisible = styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px';
      const borderVisible = styles.borderStyle !== 'none' && styles.borderWidth !== '0px';
      const shadowVisible = styles.boxShadow !== 'none';
      return outlineVisible || borderVisible || shadowVisible;
    });

    expect(hasIndicator).toBe(true);
    expect(await getAuditErrors(page)).toEqual([]);
  });

  test('Images provide meaningful alternative text', async ({ page }) => {
    const unlabeledImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter((img) => {
          const alt = img.getAttribute('alt');
          const role = img.getAttribute('role');
          const ariaHidden = img.getAttribute('aria-hidden');
          return !alt && role !== 'presentation' && ariaHidden !== 'true';
        })
        .map((img) => img.src);
    });

    expect(unlabeledImages).toEqual([]);
  });

  test('Form elements expose associated labels', async ({ page }) => {
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      return inputs
        .filter((input) => {
          const id = input.id;
          const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : false;
          const hasAriaLabel = input.getAttribute('aria-label');
          const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
          const wrapped = input.closest('label');
          return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !wrapped;
        })
        .map((input) => ({
          type: input.tagName.toLowerCase(),
          name: input.getAttribute('name'),
          id: input.id,
        }));
    });

    expect(unlabeledInputs).toEqual([]);
  });

  test('Heading hierarchy remains consistent', async ({ page }) => {
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues: string[] = [];
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count !== 1) {
        issues.push(`Expected exactly one h1, found ${h1Count}`);
      }

      let lastLevel = 0;
      for (const heading of headings) {
        const level = parseInt(heading.tagName[1], 10);
        if (level - lastLevel > 1) {
          issues.push(`Skipped heading level from h${lastLevel} to h${level}`);
        }
        lastLevel = level;
      }

      return issues;
    });

    expect(headingIssues).toEqual([]);
  });
});
