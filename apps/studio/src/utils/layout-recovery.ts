/**
 * Layout Recovery Utilities
 * Helps recover from corrupted or broken layout states
 */

import { getDefaultLayoutForScreenSize, getScreenSizeFromWidth } from '../config/layout-presets';
import type { WorkbenchLayout } from '../types/layout';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'layout-recovery' });

const STORAGE_KEY = 'brepflow-layout-state';
const LAYOUTS_KEY = 'brepflow-saved-layouts';

export interface LayoutValidationResult {
  isValid: boolean;
  issues: string[];
  layout?: WorkbenchLayout;
}

/**
 * Validates a layout object to ensure it has all required properties
 */
export function validateLayout(layout: any): LayoutValidationResult {
  const issues: string[] = [];

  if (!layout) {
    return { isValid: false, issues: ['Layout is null or undefined'] };
  }

  // Check required top-level properties
  if (!layout.id) issues.push('Missing layout.id');
  if (!layout.name) issues.push('Missing layout.name');
  if (!layout.panels) issues.push('Missing layout.panels');
  if (!layout.metadata) issues.push('Missing layout.metadata');

  // Check panels structure
  if (layout.panels) {
    const requiredPanels = ['nodePanel', 'nodeEditor', 'viewport3d', 'inspector', 'toolbar'];
    for (const panelId of requiredPanels) {
      if (!layout.panels[panelId]) {
        issues.push(`Missing panel: ${panelId}`);
      } else {
        const panel = layout.panels[panelId];
        if (typeof panel.visible !== 'boolean')
          issues.push(`Invalid visible property for ${panelId}`);
        if (typeof panel.minimized !== 'boolean')
          issues.push(`Invalid minimized property for ${panelId}`);
        if (!panel.position) issues.push(`Missing position for ${panelId}`);
        if (!panel.size) issues.push(`Missing size for ${panelId}`);
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    layout: issues.length === 0 ? (layout as WorkbenchLayout) : undefined,
  };
}

/**
 * Attempts to recover a corrupted layout by merging with default values
 */
export function recoverLayout(corruptedLayout: any): WorkbenchLayout {
  const screenSize =
    typeof window !== 'undefined' ? getScreenSizeFromWidth(window.innerWidth) : 'desktop';

  const defaultLayout = getDefaultLayoutForScreenSize(screenSize);

  // If the corrupted layout has some valid panels, try to preserve user settings
  if (corruptedLayout?.panels) {
    const recoveredPanels = { ...defaultLayout.panels };

    for (const [panelId, panel] of Object.entries(corruptedLayout.panels)) {
      if (panelId in defaultLayout.panels && typeof panel === 'object' && panel) {
        const panelConfig = panel as unknown;
        const defaultPanel = defaultLayout.panels[panelId as keyof typeof defaultLayout.panels];

        (recoveredPanels as unknown)[panelId] = {
          ...defaultPanel,
          // Preserve user settings if they're valid
          visible:
            typeof panelConfig.visible === 'boolean' ? panelConfig.visible : defaultPanel.visible,
          minimized:
            typeof panelConfig.minimized === 'boolean'
              ? panelConfig.minimized
              : defaultPanel.minimized,
        };
      }
    }

    return {
      ...defaultLayout,
      panels: recoveredPanels,
      metadata: {
        ...defaultLayout.metadata,
        modified: new Date(),
      },
    };
  }

  return defaultLayout;
}

/**
 * Clears all layout-related localStorage data
 */
export function clearLayoutStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAYOUTS_KEY);
}

/**
 * Gets a safe layout, attempting recovery if the stored layout is corrupted
 */
export function getSafeLayout(): WorkbenchLayout {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // No stored layout, use default
      return getDefaultLayoutForScreenSize(
        typeof window !== 'undefined' ? getScreenSizeFromWidth(window.innerWidth) : 'desktop'
      );
    }

    const parsed = JSON.parse(stored);
    const validation = validateLayout(parsed);

    if (validation.isValid && validation.layout) {
      return validation.layout;
    }

    // Layout is corrupted, attempt recovery
    logger.warn('🔧 Corrupted layout detected, attempting recovery:', validation.issues);
    const recovered = recoverLayout(parsed);

    // Save the recovered layout
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));

    return recovered;
  } catch (error) {
    // JSON parsing failed or other error, clear storage and use default
    logger.error('❌ Failed to load layout, using default:', error);
    clearLayoutStorage();

    return getDefaultLayoutForScreenSize(
      typeof window !== 'undefined' ? getScreenSizeFromWidth(window.innerWidth) : 'desktop'
    );
  }
}

/**
 * Force resets the layout to default (useful for debugging)
 */
export function forceResetLayout(): WorkbenchLayout {
  clearLayoutStorage();
  const defaultLayout = getDefaultLayoutForScreenSize(
    typeof window !== 'undefined' ? getScreenSizeFromWidth(window.innerWidth) : 'desktop'
  );

  // Save the default layout
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLayout));

  return defaultLayout;
}
