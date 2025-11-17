import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  LayoutStore,
  WorkbenchLayout,
  PanelId,
  PanelConfig,
  LayoutPresetId,
  ScreenSize,
  PanelSize,
  FocusMode,
} from '../types/layout';
import {
  LAYOUT_PRESETS,
  getDefaultLayoutForScreenSize,
  getScreenSizeFromWidth,
} from '../config/layout-presets';
import { getSafeLayout, validateLayout } from '../utils/layout-recovery';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'layout-store' });

const STORAGE_KEY = 'brepflow-layout-state';
const LAYOUTS_KEY = 'brepflow-saved-layouts';

// Utility functions
function getInitialScreenSize(): ScreenSize {
  if (typeof window === 'undefined') return 'desktop';
  return getScreenSizeFromWidth(window.innerWidth);
}

function getStoredLayout(): WorkbenchLayout | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStoredLayouts(): WorkbenchLayout[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LAYOUTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLayoutToStorage(layout: WorkbenchLayout) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    logger.warn('Layout save to storage failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function saveLayoutsToStorage(layouts: WorkbenchLayout[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
  } catch (error) {
    logger.warn('Layouts save to storage failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function getInitialLayout(): WorkbenchLayout {
  const screenSize = getInitialScreenSize();

  logger.info('Layout initialization', {
    screenSize,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
  });

  // Use the safe layout recovery function
  const layout = getSafeLayout();

  // Validate the screen size matches current window
  if (layout.metadata.screenSize !== screenSize) {
    logger.debug('Screen size changed, adapting layout', {
      previousSize: layout.metadata.screenSize,
      currentSize: screenSize,
    });
    const adaptedLayout = getDefaultLayoutForScreenSize(screenSize);
    return {
      ...adaptedLayout,
      metadata: {
        ...adaptedLayout.metadata,
        modified: new Date(),
      },
    };
  }

  logger.info('Layout selected', { layoutName: layout.name });
  return layout;
}

function createUpdatedLayout(
  currentLayout: WorkbenchLayout,
  panelId: PanelId,
  updates: Partial<PanelConfig>
): WorkbenchLayout {
  return {
    ...currentLayout,
    panels: {
      ...currentLayout.panels,
      [panelId]: {
        ...currentLayout.panels[panelId],
        ...updates,
      },
    },
    metadata: {
      ...currentLayout.metadata,
      modified: new Date(),
    },
  };
}

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentLayout: getInitialLayout(),
      focusMode: {
        focusedPanel: null,
        previousLayout: null,
        dimOtherPanels: true,
        hideToolbars: false,
        transitionDuration: 300,
      },
      savedLayouts: getStoredLayouts(),
      screenSize: getInitialScreenSize(),
      isInitialized: false,

      // Actions
      setLayout: (layout: WorkbenchLayout) => {
        set({ currentLayout: layout });
        saveLayoutToStorage(layout);
      },

      updatePanelConfig: (panelId: PanelId, config: Partial<PanelConfig>) => {
        set((state) => {
          const updatedLayout = createUpdatedLayout(state.currentLayout, panelId, config);
          saveLayoutToStorage(updatedLayout);
          return { currentLayout: updatedLayout };
        });
      },

      resizePanel: (panelId: PanelId, size: PanelSize) => {
        get().updatePanelConfig(panelId, { size });
      },

      togglePanelVisibility: (panelId: PanelId) => {
        set((state) => {
          const panel = state.currentLayout.panels[panelId];
          const updatedLayout = createUpdatedLayout(state.currentLayout, panelId, {
            visible: !panel.visible,
          });
          saveLayoutToStorage(updatedLayout);
          return { currentLayout: updatedLayout };
        });
      },

      minimizePanel: (panelId: PanelId) => {
        get().updatePanelConfig(panelId, { minimized: true });
      },

      maximizePanel: (panelId: PanelId) => {
        get().updatePanelConfig(panelId, { minimized: false });
      },

      // Focus mode
      enterFocusMode: (panelId: PanelId) => {
        set((state) => {
          if (state.focusMode.focusedPanel === panelId) return state;

          return {
            focusMode: {
              ...state.focusMode,
              focusedPanel: panelId,
              previousLayout: state.currentLayout,
            },
          };
        });
      },

      exitFocusMode: () => {
        set((state) => {
          const newState = {
            focusMode: {
              ...state.focusMode,
              focusedPanel: null,
            },
          };

          if (state.focusMode.previousLayout) {
            return {
              ...newState,
              currentLayout: state.focusMode.previousLayout,
              focusMode: {
                ...newState.focusMode,
                previousLayout: null,
              },
            };
          }

          return newState;
        });
      },

      // Presets
      loadPreset: (presetId: LayoutPresetId) => {
        const preset = LAYOUT_PRESETS[presetId];
        if (preset) {
          const adaptedLayout = {
            ...preset,
            id: `${presetId}-${Date.now()}`,
            metadata: {
              ...preset.metadata,
              screenSize: get().screenSize,
              modified: new Date(),
            },
          };
          get().setLayout(adaptedLayout);
        }
      },

      saveAsPreset: (name: string, description?: string) => {
        set((state) => {
          const newLayout: WorkbenchLayout = {
            ...state.currentLayout,
            id: `custom-${Date.now()}`,
            name,
            description: description || `Custom layout: ${name}`,
            metadata: {
              ...state.currentLayout.metadata,
              isDefault: false,
              created: new Date(),
              modified: new Date(),
            },
          };

          const updatedLayouts = [...state.savedLayouts, newLayout];
          saveLayoutsToStorage(updatedLayouts);

          return { savedLayouts: updatedLayouts };
        });
      },

      deletePreset: (layoutId: string) => {
        set((state) => {
          const updatedLayouts = state.savedLayouts.filter((layout) => layout.id !== layoutId);
          saveLayoutsToStorage(updatedLayouts);
          return { savedLayouts: updatedLayouts };
        });
      },

      // Utilities
      resetToDefault: () => {
        const defaultLayout = getDefaultLayoutForScreenSize(get().screenSize);
        get().setLayout(defaultLayout);
      },

      getScreenSize: () => {
        if (typeof window === 'undefined') return 'desktop';
        return getScreenSizeFromWidth(window.innerWidth);
      },

      updateScreenSize: (size: ScreenSize) => {
        set((state) => {
          if (state.screenSize === size) return state;

          // Get appropriate layout for new screen size
          const currentPresetId = Object.keys(LAYOUT_PRESETS).find(
            (key) => LAYOUT_PRESETS[key]?.name === state.currentLayout.name
          );

          let newLayout = state.currentLayout;
          if (currentPresetId && LAYOUT_PRESETS[currentPresetId]) {
            const preset = LAYOUT_PRESETS[currentPresetId];
            newLayout = {
              ...preset,
              metadata: {
                ...preset.metadata,
                screenSize: size,
                modified: new Date(),
              },
            };
          } else {
            newLayout = {
              ...state.currentLayout,
              metadata: {
                ...state.currentLayout.metadata,
                screenSize: size,
                modified: new Date(),
              },
            };
          }

          saveLayoutToStorage(newLayout);
          return {
            screenSize: size,
            currentLayout: newLayout,
          };
        });
      },

      exportLayout: () => {
        const { currentLayout } = get();
        return JSON.stringify(currentLayout, null, 2);
      },

      importLayout: (layoutJson: string) => {
        try {
          const layout: WorkbenchLayout = JSON.parse(layoutJson);

          // Validate basic structure
          if (!layout.panels || !layout.layout || !layout.metadata) {
            throw new Error('Invalid layout format');
          }

          const importedLayout = {
            ...layout,
            id: `imported-${Date.now()}`,
            metadata: {
              ...layout.metadata,
              created: new Date(),
              modified: new Date(),
              screenSize: get().screenSize,
            },
          };

          get().setLayout(importedLayout);
        } catch (error) {
          logger.error('Layout import failed', {
            error: error instanceof Error ? error.message : String(error),
          });
          throw new Error('Invalid layout format');
        }
      },
    })),
    { name: 'layout-store' }
  )
);

// Initialize screen size handling
if (typeof window !== 'undefined') {
  const handleResize = () => {
    const newScreenSize = getScreenSizeFromWidth(window.innerWidth);
    const currentScreenSize = useLayoutStore.getState().screenSize;

    if (newScreenSize !== currentScreenSize) {
      useLayoutStore.getState().updateScreenSize(newScreenSize);
    }
  };

  window.addEventListener('resize', handleResize);

  // Set initialized flag after first render
  setTimeout(() => {
    useLayoutStore.setState({ isInitialized: true });
  }, 100);
}
