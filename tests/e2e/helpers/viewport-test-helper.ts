import { Page, Locator, expect } from '@playwright/test';

export interface CameraPosition {
  azimuth: number;
  elevation: number;
}

export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Helper class for 3D viewport interaction and testing in Sim4D Studio
 * Provides methods for camera control, viewport manipulation, and visual verification
 */
export class ViewportTestHelper {
  private canvas: Locator;

  constructor(private page: Page) {
    this.canvas = this.page
      .locator('[data-testid="viewport-canvas"], [data-testid="three-canvas"], canvas')
      .first();
  }

  /**
   * Wait for viewport to be initialized and ready
   */
  async waitForViewportReady(): Promise<void> {
    // Wait for canvas to be visible
    await expect(this.canvas).toBeVisible({ timeout: 10000 });

    // Wait for Three.js/viewport to be initialized
    await this.page.waitForFunction(
      () => {
        return (
          (window as any).sim4d?.viewport?.isInitialized?.() === true ||
          (window as any).THREE !== undefined
        );
      },
      { timeout: 15000 }
    );

    // Wait for WebGL context
    await this.page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return !!gl;
      },
      { timeout: 10000 }
    );

    // Additional wait for scene setup
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get viewport canvas bounds
   */
  async getViewportBounds(): Promise<ViewportBounds> {
    const boundingBox = await this.canvas.boundingBox();
    if (!boundingBox) {
      throw new Error('Cannot get viewport bounds - canvas not visible');
    }
    return boundingBox;
  }

  /**
   * Orbit camera around the scene
   */
  async orbitCamera(azimuth: number, elevation: number): Promise<void> {
    const bounds = await this.getViewportBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    // Start drag from center
    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.down();

    // Drag to new position (simulate orbit)
    await this.page.mouse.move(centerX + azimuth, centerY + elevation, { steps: 10 });
    await this.page.mouse.up();

    // Wait for camera animation to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Zoom in/out using mouse wheel
   */
  async zoom(deltaY: number): Promise<void> {
    const bounds = await this.getViewportBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.wheel(0, deltaY);

    // Wait for zoom animation
    await this.page.waitForTimeout(300);
  }

  /**
   * Zoom in
   */
  async zoomIn(steps: number = 3): Promise<void> {
    for (let i = 0; i < steps; i++) {
      await this.zoom(-120); // Negative for zoom in
    }
  }

  /**
   * Zoom out
   */
  async zoomOut(steps: number = 3): Promise<void> {
    for (let i = 0; i < steps; i++) {
      await this.zoom(120); // Positive for zoom out
    }
  }

  /**
   * Pan camera view
   */
  async panCamera(deltaX: number, deltaY: number): Promise<void> {
    const bounds = await this.getViewportBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    // Right-click drag for panning (or middle mouse if available)
    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.down({ button: 'right' });
    await this.page.mouse.move(centerX + deltaX, centerY + deltaY, { steps: 10 });
    await this.page.mouse.up({ button: 'right' });

    await this.page.waitForTimeout(300);
  }

  /**
   * Fit all geometry in view
   */
  async fitAll(): Promise<void> {
    // Try to find and click fit view button
    const fitButton = this.page
      .locator('[data-testid="fit-view"], [data-testid="fit-all"], button:has-text("Fit")')
      .first();

    if (await fitButton.isVisible({ timeout: 2000 })) {
      await fitButton.click();
    } else {
      // Fallback: use keyboard shortcut or API call
      await this.page.keyboard.press('f');
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Reset camera to default position
   */
  async resetCamera(): Promise<void> {
    const resetButton = this.page
      .locator('[data-testid="reset-camera"], [data-testid="home-view"], button:has-text("Reset")')
      .first();

    if (await resetButton.isVisible({ timeout: 2000 })) {
      await resetButton.click();
    } else {
      // Fallback: programmatic reset
      await this.page.evaluate(() => {
        const viewport = (window as any).sim4d?.viewport;
        if (viewport?.resetCamera) {
          viewport.resetCamera();
        }
      });
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Switch rendering mode (wireframe, solid, etc.)
   */
  async setRenderingMode(mode: 'solid' | 'wireframe' | 'points'): Promise<void> {
    const modeButton = this.page
      .locator(`[data-testid="${mode}-mode"], button:has-text("${mode}")`, {
        hasText: new RegExp(mode, 'i'),
      })
      .first();

    if (await modeButton.isVisible({ timeout: 2000 })) {
      await modeButton.click();
    } else {
      // Fallback: programmatic mode change
      await this.page.evaluate((renderMode) => {
        const viewport = (window as any).sim4d?.viewport;
        if (viewport?.setRenderingMode) {
          viewport.setRenderingMode(renderMode);
        }
      }, mode);
    }

    await this.page.waitForTimeout(300);
  }

  /**
   * Take a screenshot of the viewport for visual regression testing
   */
  async takeViewportScreenshot(name: string): Promise<void> {
    await expect(this.canvas).toHaveScreenshot(name);
  }

  /**
   * Wait for geometry to be rendered
   */
  async waitForGeometryRendered(): Promise<void> {
    // Wait for render complete indicator
    await this.page.waitForSelector(
      '[data-testid="render-complete"], [data-testid="geometry-rendered"]',
      {
        timeout: 15000,
      }
    );

    // Additional wait for frame rendering
    await this.page.waitForTimeout(500);
  }

  /**
   * Get viewport performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    fps: number;
    renderTime: number;
    triangleCount: number;
  }> {
    return await this.page.evaluate(() => {
      const viewport = (window as any).sim4d?.viewport;
      return {
        fps: viewport?.getFPS?.() || 0,
        renderTime: viewport?.getLastRenderTime?.() || 0,
        triangleCount: viewport?.getTriangleCount?.() || 0,
      };
    });
  }

  /**
   * Verify viewport responsiveness
   */
  async verifyViewportResponsiveness(maxRenderTime: number = 100): Promise<void> {
    const startTime = await this.page.evaluate(() => performance.now());

    // Trigger a complex viewport operation
    await this.orbitCamera(45, 30);

    const endTime = await this.page.evaluate(() => performance.now());
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(maxRenderTime);
  }

  /**
   * Test viewport under load
   */
  async stressTestViewport(duration: number = 5000): Promise<{
    averageFPS: number;
    minFPS: number;
    maxRenderTime: number;
  }> {
    const startTime = Date.now();
    const fpsReadings: number[] = [];
    const renderTimes: number[] = [];

    while (Date.now() - startTime < duration) {
      // Perform random camera movements
      await this.orbitCamera(Math.random() * 90 - 45, Math.random() * 60 - 30);

      // Collect performance data
      const metrics = await this.getPerformanceMetrics();
      fpsReadings.push(metrics.fps);
      renderTimes.push(metrics.renderTime);

      await this.page.waitForTimeout(100);
    }

    return {
      averageFPS: fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length,
      minFPS: Math.min(...fpsReadings),
      maxRenderTime: Math.max(...renderTimes),
    };
  }

  /**
   * Verify geometry is visible in viewport
   */
  async verifyGeometryVisible(): Promise<void> {
    const hasGeometry = await this.page.evaluate(() => {
      const viewport = (window as any).sim4d?.viewport;
      return viewport?.hasGeometry?.() || false;
    });

    expect(hasGeometry).toBe(true);
  }

  /**
   * Change a parameter and verify geometry updates
   */
  async changeParameterAndVerifyGeometry(
    paramName: string,
    value: string,
    screenshotName: string
  ): Promise<void> {
    // Change parameter
    await this.page.fill(
      `[data-testid="inspector-param-${paramName}"], [name="${paramName}"]`,
      value
    );

    // Trigger evaluation
    const evaluateButton = this.page
      .locator('[data-testid="evaluate"], button:has-text("Evaluate")')
      .first();
    if (await evaluateButton.isVisible({ timeout: 2000 })) {
      await evaluateButton.click();
    }

    // Wait for geometry update
    await this.waitForGeometryRendered();

    // Take screenshot for verification
    await this.takeViewportScreenshot(screenshotName);
  }

  /**
   * Click on geometry in viewport (for selection)
   */
  async clickGeometry(x?: number, y?: number): Promise<void> {
    const bounds = await this.getViewportBounds();
    const clickX = x !== undefined ? bounds.x + x : bounds.x + bounds.width / 2;
    const clickY = y !== undefined ? bounds.y + y : bounds.y + bounds.height / 2;

    await this.page.mouse.click(clickX, clickY);
    await this.page.waitForTimeout(200);
  }

  /**
   * Verify viewport shows expected number of objects
   */
  async verifyObjectCount(expectedCount: number): Promise<void> {
    const objectCount = await this.page.evaluate(() => {
      const viewport = (window as any).sim4d?.viewport;
      return viewport?.getObjectCount?.() || 0;
    });

    expect(objectCount).toBe(expectedCount);
  }

  /**
   * Toggle viewport overlays (grid, axes, etc.)
   */
  async toggleOverlay(overlay: 'grid' | 'axes' | 'stats'): Promise<void> {
    const toggleButton = this.page
      .locator(`[data-testid="toggle-${overlay}"], button:has-text("${overlay}")`, {
        hasText: new RegExp(overlay, 'i'),
      })
      .first();

    if (await toggleButton.isVisible({ timeout: 2000 })) {
      await toggleButton.click();
    } else {
      // Fallback: keyboard shortcut
      const shortcuts: Record<string, string> = {
        grid: 'g',
        axes: 'a',
        stats: 's',
      };
      await this.page.keyboard.press(shortcuts[overlay] || 'g');
    }

    await this.page.waitForTimeout(200);
  }
}
