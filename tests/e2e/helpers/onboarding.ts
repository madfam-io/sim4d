/**
 * E2E Test Helpers for Onboarding
 */

import type { Page } from '@playwright/test';

/**
 * Dismiss onboarding welcome screen if present
 *
 * The Studio app shows an onboarding welcome screen on first visit,
 * asking users to choose their experience level. This helper dismisses
 * it by clicking "Let Me Explore" to skip directly to the main app.
 */
export async function dismissOnboardingIfPresent(page: Page): Promise<void> {
  try {
    // Check if welcome screen is visible
    const welcomeScreen = page.locator('.welcome-screen-overlay');
    const isVisible = await welcomeScreen.isVisible({ timeout: 2000 });

    if (isVisible) {
      // Click "Let Me Explore" button to skip onboarding
      const skipButton = page.locator('.skill-card').filter({ hasText: 'Let Me Explore' });
      await skipButton.click();

      // Wait for welcome screen to disappear AND main app to be visible
      await Promise.all([
        welcomeScreen.waitFor({ state: 'hidden', timeout: 10000 }),
        // Wait for main app elements to appear (node editor or canvas)
        page.waitForSelector('.react-flow, canvas, .node-editor', { timeout: 10000 }).catch(() => {
          // If main app doesn't appear, that's ok - might be showing tour/playground
        }),
      ]);

      // Give React time to settle after state changes
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // Welcome screen not present or already dismissed - continue
    // This is expected if onboarding was already completed in a previous test
  }
}

/**
 * Setup page for E2E test with onboarding handling
 *
 * Navigates to the app, waits for load, and dismisses onboarding if needed.
 * Use this in test.beforeEach() hooks for consistent setup.
 */
export async function setupPageForTest(
  page: Page,
  url: string = 'http://localhost:5173'
): Promise<void> {
  // Navigate to Studio app
  await page.goto(url);

  // Wait for DOM to be ready (not networkidle - Vite HMR keeps network active)
  await page.waitForLoadState('domcontentloaded');

  // Dismiss onboarding welcome screen if present
  await dismissOnboardingIfPresent(page);
}
