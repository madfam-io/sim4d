import type { Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();

interface OnboardingState {
  isFirstVisit: boolean;
  currentStep: number;
  completedTutorials: string[];
  userSkillLevel: string;
  currentPlayground: string | null;
  showHints: boolean;
  tourMode: boolean;
  analytics: {
    sessionId: string;
    startTime: number;
    events: any[];
  };
}

declare global {
  interface Window {
    __auditErrors?: string[];
    __auditAddConsoleError?: (message: string) => void;
  }
}

export async function bootstrapStudio(page: Page): Promise<void> {
  const errorBucket: string[] = [];
  runtimeErrors.set(page, errorBucket);

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errorBucket.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errorBucket.push(error.message);
  });

  await page.exposeFunction('__auditAddConsoleError', (message: string) => {
    errorBucket.push(message);
  });

  await page.addInitScript(() => {
    const onboardingState: OnboardingState = {
      isFirstVisit: false,
      currentStep: 4,
      completedTutorials: ['quickstart'],
      userSkillLevel: 'journeyman',
      currentPlayground: null,
      showHints: false,
      tourMode: false,
      analytics: {
        sessionId: 'audit-suite',
        startTime: Date.now(),
        events: [],
      },
    };

    try {
      window.localStorage.setItem('sim4d-visited', 'true');
      window.localStorage.setItem('sim4d-onboarding-state', JSON.stringify(onboardingState));
    } catch (error) {
      // Local storage may be unavailable in some contexts; swallow errors for tests
    }

    window.__auditErrors = [];

    const originalConsoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === 'string') {
            return arg;
          }
          try {
            return JSON.stringify(arg);
          } catch (error) {
            return String(arg);
          }
        })
        .join(' ');

      window.__auditErrors?.push(message);
      try {
        window.__auditAddConsoleError?.(message);
      } catch (error) {
        // ignore bridge errors
      }

      originalConsoleError(...args);
    };

    window.addEventListener('error', (event) => {
      const message = event.message || (event.error ? String(event.error) : 'Unknown error');
      window.__auditErrors?.push(message);
      try {
        window.__auditAddConsoleError?.(message);
      } catch (error) {
        // ignore bridge errors
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
      window.__auditErrors?.push(reason);
      try {
        window.__auditAddConsoleError?.(reason);
      } catch (error) {
        // ignore bridge errors
      }
    });
  });

  await page.goto('/');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#root', { state: 'attached' });

  const initialErrors = await getAuditErrors(page);
  if (initialErrors.length > 0) {
    throw new Error(
      `Studio bootstrap emitted ${initialErrors.length} console error(s): ${initialErrors.slice(0, 3).join(' | ')}`
    );
  }

  await clearAuditErrors(page);
}

export async function clearAuditErrors(page: Page): Promise<void> {
  const bucket = runtimeErrors.get(page);
  if (bucket) {
    bucket.length = 0;
  }

  try {
    await page.evaluate(() => {
      window.__auditErrors = [];
    });
  } catch (error) {
    // Page might be gone; ignore
  }
}

export async function getAuditErrors(page: Page): Promise<string[]> {
  const bucket = runtimeErrors.get(page) ?? [];
  let pageErrors: string[] = [];
  try {
    pageErrors = await page.evaluate(() => window.__auditErrors ?? []);
  } catch (error) {
    pageErrors = [];
  }

  return [...pageErrors, ...bucket];
}

export async function ensureCanvasReady(page: Page, timeout = 10000) {
  const canvasLocator = page.locator('.react-flow');
  try {
    await canvasLocator.first().waitFor({ state: 'visible', timeout });
    return canvasLocator.first();
  } catch (error) {
    return null;
  }
}
