# Multi-Viewport System Implementation

This document describes the implementation of the multi-viewport system for BrepFlow Studio.

## Overview

The multi-viewport system allows users to work with multiple 3D viewports simultaneously, each with independent cameras and render settings while sharing the same geometry data.

## Components Implemented

### 1. Multi-Viewport Interfaces (`multi-viewport-interfaces.ts`)

Defines the core types and interfaces for the multi-viewport system:

- **ViewportLayoutType**: `'single' | 'quad' | 'horizontal' | 'vertical' | 'custom'`
- **ViewportViewType**: Standard view types (perspective, front, back, left, right, top, bottom, iso)
- **ViewportRenderMode**: Render modes (wireframe, shaded, textured, xray, realistic)
- **ViewportCameraState**: Camera position, target, up vector, FOV, zoom
- **ViewportInstance**: Complete viewport configuration
- **ViewportLayoutConfig**: Layout configuration with multiple viewports

### 2. ViewportInstance Component (`ViewportInstance.tsx`)

Individual viewport wrapper that:

- Wraps the existing Enhanced3DViewport component
- Provides viewport-specific controls (render mode, view type)
- Shows active viewport indicators
- Handles keyboard shortcuts for view switching
- Displays viewport status (camera mode, zoom, quality)

**Key Features:**

- Header with viewport name and view type
- Render mode toggle button (R key)
- View type dropdown menu (1-7 keys for standard views)
- Active viewport highlighting
- Camera state display
- Quality indicator

### 3. ViewportLayoutManager Component (`ViewportLayoutManager.tsx`)

Main layout management component that:

- Manages multiple viewport instances
- Handles layout switching (single ↔ quad ↔ horizontal ↔ vertical)
- Uses react-resizable-panels for dynamic resizing
- Supports camera synchronization across viewports
- Provides keyboard shortcuts for layout switching

**Key Features:**

- Layout controls with visual layout selector
- Camera sync toggle
- Active viewport information display
- Keyboard shortcuts (Ctrl+1-4 for layout switching, Tab to cycle viewports)
- Responsive design with mobile fallback

### 4. Professional Styling

**ViewportInstance.css:**

- Professional design with enhanced design tokens
- Active viewport highlighting with gradient borders
- Smooth animations and transitions
- Responsive design for different screen sizes
- Accessibility support (focus indicators, high contrast)

**ViewportLayoutManager.css:**

- Layout-specific styling for different configurations
- Professional resize handles with hover states
- Camera sync visual indicators
- Mobile-responsive with graceful degradation

## Integration with App.tsx

The ViewportLayoutManager has been integrated into the main App.tsx, replacing the single Viewport component:

```tsx
viewport3d: (
  <WASMErrorBoundary>
    <GeometryErrorBoundary>
      <ViewportLayoutManager
        initialLayout="single"
        enableKeyboardShortcuts={true}
        showLayoutControls={true}
        onLayoutChange={(layout) => { /* monitoring */ }}
        onViewportSelect={(viewportId) => { /* monitoring */ }}
        onCameraChange={(viewportId, camera) => { /* monitoring */ }}
        onRenderModeChange={(viewportId, mode) => { /* monitoring */ }}
        geometryData={graph}
      />
    </GeometryErrorBoundary>
  </WASMErrorBoundary>
),
```

## Usage Guide

### Layout Switching

- **Keyboard**: Ctrl+1 (single), Ctrl+2 (horizontal), Ctrl+3 (vertical), Ctrl+4 (quad)
- **UI**: Click the layout button in the top toolbar

### Viewport Navigation

- **Keyboard**: Tab to cycle between viewports
- **UI**: Click on any viewport to make it active

### View Controls (per viewport)

- **R key**: Cycle through render modes
- **1-7 keys**: Switch to standard views (Front, Back, Left, Right, Top, Bottom, ISO)
- **UI**: Use the render mode and view type buttons in each viewport header

### Camera Synchronization

- Click the camera sync button to link all viewport cameras
- When enabled, camera movements in the active viewport affect all viewports

## Architecture Benefits

1. **Backward Compatibility**: Single viewport mode works exactly as before
2. **Modular Design**: Each component has clear responsibilities
3. **Performance Optimized**: Inactive viewports have reduced UI overhead
4. **Extensible**: Easy to add new layout types and features
5. **Professional UX**: Consistent with CAD industry standards

## Future Enhancements

1. **Custom Layouts**: User-defined viewport arrangements
2. **Viewport Templates**: Save/load viewport configurations
3. **Advanced Camera Sync**: Selective sync options (pan only, zoom only, etc.)
4. **Viewport Locking**: Lock specific viewports from changes
5. **Performance Tuning**: Adaptive quality based on viewport count

## Technical Notes

- Uses react-resizable-panels for smooth resizing
- Integrates with existing Enhanced3DViewport component
- Maintains compatibility with WorkbenchLayoutManager
- Follows BrepFlow design system tokens
- Includes comprehensive accessibility support
- Mobile-responsive with graceful degradation to single viewport

## Testing

The implementation can be tested by:

1. Starting the development server: `pnpm -w run dev`
2. Navigating to http://localhost:5173
3. Using the layout controls in the viewport area
4. Testing keyboard shortcuts and viewport interactions

The multi-viewport system is now fully integrated and ready for use in BrepFlow Studio.
