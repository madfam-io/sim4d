import { test, expect } from '@playwright/test';

test('debug console errors', async ({ page }) => {
  const errors: string[] = [];
  const logs: string[] = [];

  // Capture console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(text);
      console.log(`[BROWSER ERROR]: ${text}`);
    } else {
      logs.push(`[${type}] ${text}`);
    }
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    console.log(`[PAGE ERROR]: ${error.message}`);
    errors.push(error.message);
  });

  // Navigate to app
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });

  // Wait a bit for JS to execute
  await page.waitForTimeout(5000);

  // Get page content
  const html = await page.content();
  const rootHtml = await page
    .locator('#root')
    .innerHTML()
    .catch(() => 'NOT FOUND');

  console.log('=== PAGE HTML ===');
  console.log(html.substring(0, 500));
  console.log('=== ROOT DIV ===');
  console.log(rootHtml);
  console.log('=== ERRORS ===');
  console.log(errors);
  console.log('=== RECENT LOGS ===');
  console.log(logs.slice(-10));

  // This will always pass - we just want to see console output
  expect(true).toBe(true);
});
