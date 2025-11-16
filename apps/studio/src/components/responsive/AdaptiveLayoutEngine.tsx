import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveLayoutManager } from './ResponsiveLayoutManager';
import './AdaptiveLayoutEngine.css';

interface DeviceProfile {
  type: 'mobile' | 'tablet' | 'desktop' | 'ultra-wide';
  orientation: 'portrait' | 'landscape';
  inputMethod: 'touch' | 'mouse' | 'hybrid';
  screenSize: 'small' | 'medium' | 'large' | 'xl';
  pixelDensity: 'standard' | 'high' | 'ultra';
  performance: 'low' | 'medium' | 'high';
}

interface LayoutStrategy {
  layout: 'single' | 'dual' | 'triple' | 'quad' | 'custom';
  panelArrangement: 'horizontal' | 'vertical' | 'grid' | 'floating';
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  navigationStyle: 'tabs' | 'drawer' | 'sidebar' | 'ribbon';
  interactionMode: 'compact' | 'comfortable' | 'spacious';
}

interface AdaptiveLayoutEngineProps {
  children?: React.ReactNode;
}

export const AdaptiveLayoutEngine: React.FC<AdaptiveLayoutEngineProps> = ({ children }) => {
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile | null>(null);
  const [layoutStrategy, setLayoutStrategy] = useState<LayoutStrategy | null>(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });

  // Detect device capabilities
  const detectDeviceProfile = useCallback((): DeviceProfile => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasMouse = matchMedia('(hover: hover)').matches;
    const pixelRatio = window.devicePixelRatio || 1;

    // Determine device type
    let type: DeviceProfile['type'] = 'desktop';
    if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    } else if (width > 2560) {
      type = 'ultra-wide';
    }

    // Determine screen size category
    let screenSize: DeviceProfile['screenSize'] = 'medium';
    if (width < 480) {
      screenSize = 'small';
    } else if (width > 1920) {
      screenSize = 'large';
    } else if (width > 3840) {
      screenSize = 'xl';
    }

    // Determine input method
    let inputMethod: DeviceProfile['inputMethod'] = 'mouse';
    if (hasTouch && !hasMouse) {
      inputMethod = 'touch';
    } else if (hasTouch && hasMouse) {
      inputMethod = 'hybrid';
    }

    // Determine pixel density
    let pixelDensity: DeviceProfile['pixelDensity'] = 'standard';
    if (pixelRatio > 1.5) {
      pixelDensity = 'high';
    } else if (pixelRatio > 2.5) {
      pixelDensity = 'ultra';
    }

    // Estimate performance tier (simplified)
    const performance: DeviceProfile['performance'] =
      navigator.hardwareConcurrency > 4
        ? 'high'
        : navigator.hardwareConcurrency > 2
          ? 'medium'
          : 'low';

    return {
      type,
      orientation,
      inputMethod,
      screenSize,
      pixelDensity,
      performance,
    };
  }, []);

  // Calculate optimal layout strategy based on device profile
  const calculateLayoutStrategy = useCallback((profile: DeviceProfile): LayoutStrategy => {
    const strategies: Record<string, LayoutStrategy> = {
      // Mobile Portrait
      'mobile-portrait': {
        layout: 'single',
        panelArrangement: 'vertical',
        toolbarPosition: 'bottom',
        navigationStyle: 'tabs',
        interactionMode: 'compact',
      },
      // Mobile Landscape
      'mobile-landscape': {
        layout: 'dual',
        panelArrangement: 'horizontal',
        toolbarPosition: 'bottom',
        navigationStyle: 'tabs',
        interactionMode: 'compact',
      },
      // Tablet Portrait
      'tablet-portrait': {
        layout: 'dual',
        panelArrangement: 'vertical',
        toolbarPosition: 'top',
        navigationStyle: 'drawer',
        interactionMode: 'comfortable',
      },
      // Tablet Landscape
      'tablet-landscape': {
        layout: 'triple',
        panelArrangement: 'horizontal',
        toolbarPosition: 'top',
        navigationStyle: 'sidebar',
        interactionMode: 'comfortable',
      },
      // Desktop
      desktop: {
        layout: 'triple',
        panelArrangement: 'grid',
        toolbarPosition: 'top',
        navigationStyle: 'ribbon',
        interactionMode: 'spacious',
      },
      // Ultra-wide
      'ultra-wide': {
        layout: 'quad',
        panelArrangement: 'grid',
        toolbarPosition: 'top',
        navigationStyle: 'ribbon',
        interactionMode: 'spacious',
      },
    };

    // Generate strategy key
    const key =
      profile.type === 'desktop' || profile.type === 'ultra-wide'
        ? profile.type
        : `${profile.type}-${profile.orientation}`;

    // Get base strategy
    let strategy = strategies[key] || strategies['desktop'];

    // Adjust for performance
    if (profile.performance === 'low') {
      strategy = {
        ...strategy,
        layout:
          strategy.layout === 'quad'
            ? 'triple'
            : strategy.layout === 'triple'
              ? 'dual'
              : strategy.layout,
        interactionMode: 'compact',
      };
    }

    // Adjust for input method
    if (profile.inputMethod === 'touch') {
      strategy = {
        ...strategy,
        interactionMode:
          strategy.interactionMode === 'spacious' ? 'comfortable' : strategy.interactionMode,
        toolbarPosition: 'bottom', // Better for thumb reach
      };
    }

    return strategy;
  }, []);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewportDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const profile = detectDeviceProfile();
      setDeviceProfile(profile);
      setLayoutStrategy(calculateLayoutStrategy(profile));
    };

    // Initial detection
    handleResize();

    // Listen for changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Also listen for device capability changes
    const mediaQueryList = matchMedia('(hover: hover)');
    mediaQueryList.addEventListener('change', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      mediaQueryList.removeEventListener('change', handleResize);
    };
  }, [detectDeviceProfile, calculateLayoutStrategy]);

  // Generate CSS variables for adaptive spacing
  const cssVariables = useMemo(() => {
    if (!layoutStrategy) return {};

    const spacing = {
      compact: { base: 4, panel: 8, toolbar: 48 },
      comfortable: { base: 8, panel: 16, toolbar: 56 },
      spacious: { base: 12, panel: 24, toolbar: 64 },
    };

    const mode = layoutStrategy.interactionMode;
    return {
      '--adaptive-spacing-base': `${spacing[mode].base}px`,
      '--adaptive-spacing-panel': `${spacing[mode].panel}px`,
      '--adaptive-toolbar-height': `${spacing[mode].toolbar}px`,
      '--adaptive-touch-target':
        mode === 'compact' ? '44px' : mode === 'comfortable' ? '48px' : '40px',
    };
  }, [layoutStrategy]);

  // Render adaptive layout
  if (!deviceProfile || !layoutStrategy) {
    return <div className="adaptive-loading">Optimizing layout...</div>;
  }

  return (
    <div
      className={`adaptive-layout-engine ${deviceProfile.type} ${layoutStrategy.layout}`}
      data-device-type={deviceProfile.type}
      data-orientation={deviceProfile.orientation}
      data-input={deviceProfile.inputMethod}
      data-performance={deviceProfile.performance}
      data-layout-strategy={layoutStrategy.layout}
      data-panel-arrangement={layoutStrategy.panelArrangement}
      data-navigation-style={layoutStrategy.navigationStyle}
      data-interaction-mode={layoutStrategy.interactionMode}
      style={cssVariables as React.CSSProperties}
    >
      <div className="adaptive-metadata">
        <span className="device-info">
          {deviceProfile.type} | {deviceProfile.orientation} | {viewportDimensions.width}×
          {viewportDimensions.height}
        </span>
        <span className="layout-info">
          {layoutStrategy.layout} layout | {layoutStrategy.panelArrangement} panels
        </span>
      </div>

      {/* Adaptive toolbar positioning */}
      <div className={`adaptive-toolbar toolbar-${layoutStrategy.toolbarPosition}`}>
        <div className="toolbar-content">{/* Toolbar items adapt based on available space */}</div>
      </div>

      {/* Main content area with adaptive panel arrangement */}
      <div className={`adaptive-content arrangement-${layoutStrategy.panelArrangement}`}>
        {children || (
          <ResponsiveLayoutManager
            {...({
              forceDevice: deviceProfile.type,
              layoutHint: layoutStrategy.layout,
            } as any)}
          />
        )}
      </div>

      {/* Adaptive navigation */}
      <div className={`adaptive-navigation nav-${layoutStrategy.navigationStyle}`}>
        {/* Navigation adapts to device and orientation */}
      </div>

      {/* Performance monitor (dev mode only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-monitor">
          <span>FPS: calculating...</span>
          <span>
            Memory:{' '}
            {(performance as any).memory
              ? `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB`
              : 'N/A'}
          </span>
          <span>Profile: {deviceProfile.performance}</span>
        </div>
      )}
    </div>
  );
};

// Export utility hooks for components to use
export const useDeviceProfile = () => {
  const [profile, setProfile] = useState<DeviceProfile | null>(null);

  useEffect(() => {
    const detectProfile = () => {
      // Note: In real implementation, this would be a context or global state
      // Device profile detection logic would go here
    };
    detectProfile();
  }, []);

  return profile;
};

export const useAdaptiveSpacing = (
  mode: 'compact' | 'comfortable' | 'spacious' = 'comfortable'
) => {
  return useMemo(
    () => ({
      xs: mode === 'compact' ? 2 : mode === 'comfortable' ? 4 : 6,
      sm: mode === 'compact' ? 4 : mode === 'comfortable' ? 8 : 12,
      md: mode === 'compact' ? 8 : mode === 'comfortable' ? 16 : 24,
      lg: mode === 'compact' ? 16 : mode === 'comfortable' ? 24 : 32,
      xl: mode === 'compact' ? 24 : mode === 'comfortable' ? 32 : 48,
    }),
    [mode]
  );
};
