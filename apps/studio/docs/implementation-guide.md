# BrepFlow Studio Enhanced UI/UX Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the enhanced UI/UX design system in BrepFlow Studio. The new system delivers professional CAD-grade experience that rivals SolidWorks, Fusion 360, and Onshape.

## Quick Start

### 1. Import Enhanced Components

```tsx
// Replace existing imports with enhanced components
import {
  Button,
  IconButton,
  Panel,
  PanelSection,
  Input,
  NumberInput,
  CoordinateInput,
  Enhanced3DViewport,
  DESIGN_TOKENS,
} from './components/ui';
```

### 2. Update Design Tokens

The enhanced design tokens are already integrated into your existing `tokens.css`. Key improvements include:

- **Engineering Blue** color palette for professional CAD feel
- **Technical Gray** neutrals for precise interfaces
- **Precision Orange** accents for measurements and highlights
- **Enhanced shadows** for better depth perception
- **Professional typography** hierarchy

### 3. Replace Existing Components

#### Before (Old Button):

```tsx
<button className="btn btn-primary">Save Project</button>
```

#### After (Enhanced Button):

```tsx
<Button variant="primary" icon="save" size="md">
  Save Project
</Button>
```

#### Before (Old Panel):

```tsx
<div className="panel">
  <div className="panel-header">
    <h3>Properties</h3>
  </div>
  <div className="panel-content">{children}</div>
</div>
```

#### After (Enhanced Panel):

```tsx
<Panel
  title="Properties"
  subtitle="Node parameters"
  collapsible
  resizable
  headerActions={<IconButton icon="settings" />}
>
  {children}
</Panel>
```

## Component Integration

### Enhanced Buttons

```tsx
// Primary action button
<Button variant="primary" icon="play" size="md">
  Evaluate Graph
</Button>

// Secondary button
<Button variant="secondary" icon="save" size="sm">
  Save
</Button>

// Icon-only button
<IconButton
  icon="settings"
  variant="ghost"
  size="md"
  aria-label="Open settings"
/>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>
```

### Professional Panels

```tsx
// Collapsible panel with sections
<Panel title="Node Library" subtitle="Drag to add to canvas">
  <PanelSection title="Geometry" collapsible>
    <NodeLibrarySection category="geometry" />
  </PanelSection>

  <PanelSection title="Operations" collapsible defaultCollapsed>
    <NodeLibrarySection category="operations" />
  </PanelSection>
</Panel>

// Resizable panel
<Panel
  title="Properties"
  resizable
  minWidth={280}
  maxWidth={480}
  onResize={(width) => console.log('Panel resized to:', width)}
>
  <PropertyEditor />
</Panel>

// Floating panel
<Panel
  variant="floating"
  title="Measurement Tools"
  style={{ top: '100px', left: '20px' }}
>
  <MeasurementTools />
</Panel>
```

### Enhanced Form Controls

```tsx
// Basic input
<Input
  label="Project Name"
  placeholder="Enter project name"
  helpText="Choose a descriptive name"
/>

// Technical number input
<NumberInput
  label="Width"
  value={width}
  onValueChange={setWidth}
  unit="mm"
  precision={2}
  variant="measurement"
  min={0}
  max={1000}
/>

// Coordinate input for 3D positions
<CoordinateInput
  value={{ x: 10, y: 20, z: 30 }}
  onChange={(coords) => setPosition(coords)}
  unit="mm"
  precision={1}
  labels={{ x: 'X', y: 'Y', z: 'Z' }}
/>

// Input with validation
<Input
  label="Email"
  type="email"
  errorText={errors.email}
  leftIcon="mail"
  clearable
  onClear={() => setValue('')}
/>
```

### Enhanced 3D Viewport

```tsx
<Enhanced3DViewport
  onToolChange={(tool) => {
    console.log('Active tool:', tool);
    setActiveTool(tool);
  }}
  onViewChange={(view) => {
    console.log('View changed to:', view);
    setActiveView(view);
  }}
  onMeasurement={(type, data) => {
    console.log('Measurement:', type, data);
    addMeasurement(data);
  }}
/>
```

## Layout Integration

### Professional Workspace Layout

```tsx
const EnhancedWorkspace: React.FC = () => {
  return (
    <div className="workbench-layout">
      {/* Professional Toolbar */}
      <div className="workbench-toolbar">
        <div className="toolbar-brand">
          <IconButton icon="menu" />
          <h1 className="text-h3">BrepFlow Studio</h1>
        </div>

        <div className="toolbar-actions">
          <Button variant="primary" icon="play" size="sm">
            Evaluate
          </Button>
          <Button variant="secondary" icon="save" size="sm">
            Save
          </Button>
          <IconButton icon="settings" />
        </div>
      </div>

      {/* Enhanced Sidebar */}
      <div className="workbench-sidebar">
        <Panel title="Node Library" className="h-full">
          <NodeLibrary />
        </Panel>
      </div>

      {/* Main Content Area */}
      <div className="workbench-main">
        {/* Split between node editor and 3D viewport */}
        <div className="split-view">
          <Panel title="Node Editor" className="flex-1">
            <NodeEditor />
          </Panel>

          <Panel title="3D Viewport" className="flex-1">
            <Enhanced3DViewport />
          </Panel>
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="workbench-inspector">
        <Panel title="Properties" resizable>
          <Inspector />
        </Panel>
      </div>

      {/* Console */}
      <div className="workbench-console">
        <Panel title="Console" variant="compact">
          <Console />
        </Panel>
      </div>
    </div>
  );
};
```

## Design System Usage

### Color Tokens

```tsx
// Use design tokens for consistent colors
const nodeStyle = {
  background: DESIGN_TOKENS.colors.engineering[50],
  border: `1px solid ${DESIGN_TOKENS.colors.engineering[200]}`,
  color: DESIGN_TOKENS.colors.engineering[700],
};

// Status colors for different states
const getNodeStatusColor = (status: string) => {
  switch (status) {
    case 'valid':
      return DESIGN_TOKENS.colors.status.geometryValid;
    case 'invalid':
      return DESIGN_TOKENS.colors.status.geometryInvalid;
    case 'pending':
      return DESIGN_TOKENS.colors.status.geometryPending;
    default:
      return DESIGN_TOKENS.colors.technical[500];
  }
};
```

### Typography System

```tsx
// Professional typography hierarchy
<div>
  <h1 className="text-display-lg">BrepFlow Studio</h1>
  <h2 className="text-h1">Project Settings</h2>
  <h3 className="text-h2">Node Properties</h3>
  <p className="text-body-md">Configure your node parameters below.</p>
  <span className="text-caption">Last modified: 2 minutes ago</span>
  <code className="text-code">Box::width = 100mm</code>
</div>
```

### Professional Spacing

```tsx
// Use consistent spacing tokens
const containerStyle = {
  padding: DESIGN_TOKENS.spacing[4],
  margin: DESIGN_TOKENS.spacing[2],
  gap: DESIGN_TOKENS.spacing[3],
};

// Component sizing
const buttonStyle = {
  height: COMPONENT_SIZES.button.md.height,
  padding: COMPONENT_SIZES.button.md.padding,
};
```

## Accessibility Implementation

### ARIA Labels and Roles

```tsx
// Proper ARIA labels for screen readers
<Button aria-label="Save project to disk">
  <Icon name="save" />
</Button>

<Panel
  title="Node Editor"
  role="region"
  aria-label="Visual node programming interface"
>
  <NodeEditor />
</Panel>

// Measurement tools with proper descriptions
<IconButton
  icon="ruler"
  aria-label="Measure distance between two points"
  aria-describedby="measurement-help"
/>
<div id="measurement-help" className="sr-only">
  Click two points in the viewport to measure distance
</div>
```

### Keyboard Navigation

```tsx
// Enhanced keyboard support
const handleKeyDown = (e: KeyboardEvent) => {
  // Professional CAD shortcuts
  if (e.key === 'f' && !e.ctrlKey) {
    // Fit viewport to all objects
    fitViewport();
  }

  if (e.key === 'o' && !e.ctrlKey) {
    // Activate orbit tool
    setActiveTool('orbit');
  }

  if (e.key === 'Escape') {
    // Deselect all / exit current tool
    clearSelection();
  }
};
```

### Focus Management

```tsx
// Proper focus indicators
.btn:focus-visible {
  outline: 2px solid var(--color-engineering-500);
  outline-offset: 2px;
}

// Focus trap for modals
import { useFocusTrap } from './hooks/useFocusTrap';

const Modal: React.FC = ({ children }) => {
  const focusTrapRef = useFocusTrap();

  return (
    <div ref={focusTrapRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
};
```

## Performance Optimization

### Component Memoization

```tsx
// Memoize expensive components
const MemoizedNodeEditor = React.memo(NodeEditor, (prev, next) => {
  return prev.nodes === next.nodes && prev.edges === next.edges;
});

// Optimize viewport rendering
const Enhanced3DViewport = React.memo(() => {
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    triangles: 0,
    renderTime: 0,
  });

  // Throttle performance updates
  const updatePerformance = useCallback(
    throttle((stats) => setPerformanceStats(stats), 1000),
    []
  );

  return (
    <div className="viewport">
      <canvas ref={canvasRef} />
      <PerformanceMonitor stats={performanceStats} />
    </div>
  );
});
```

### CSS Optimization

```css
/* Use CSS containment for better performance */
.panel-content {
  contain: layout style paint;
}

.node-editor {
  contain: layout style;
}

.viewport-canvas {
  contain: strict;
}

/* Optimize animations */
.btn {
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Reduce repaints */
.measurement-panel {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## Migration Strategy

### Phase 1: Core Components (Week 1-2)

1. Replace all buttons with `Button` and `IconButton`
2. Update form inputs to use `Input` and `NumberInput`
3. Integrate enhanced design tokens

### Phase 2: Layout Enhancement (Week 3-4)

1. Implement `Panel` components
2. Update workspace layout system
3. Add professional toolbar

### Phase 3: 3D Viewport (Week 5-6)

1. Integrate `Enhanced3DViewport`
2. Add measurement tools
3. Implement navigation cube

### Phase 4: Polish & Optimization (Week 7-8)

1. Add animations and micro-interactions
2. Optimize performance
3. Accessibility audit and fixes

## Testing Strategy

### Visual Regression Testing

```typescript
// Test component visual consistency
describe('Enhanced Button', () => {
  it('matches visual snapshot for all variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'danger'];
    variants.forEach(variant => {
      render(<Button variant={variant}>Test</Button>);
      expect(screen.getByRole('button')).toMatchSnapshot();
    });
  });
});
```

### Accessibility Testing

```typescript
// Test ARIA compliance
describe('Enhanced Panel', () => {
  it('has proper ARIA attributes', () => {
    render(
      <Panel title="Test Panel" collapsible>
        <div>Content</div>
      </Panel>
    );

    expect(screen.getByRole('button', { name: /collapse/i }))
      .toHaveAttribute('aria-expanded', 'true');
  });
});
```

### Performance Testing

```typescript
// Test rendering performance
describe('Enhanced3DViewport', () => {
  it('maintains 60fps under normal load', async () => {
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const avgFrameTime = entries.reduce((sum, entry) =>
        sum + entry.duration, 0) / entries.length;

      expect(avgFrameTime).toBeLessThan(16.67); // 60fps = 16.67ms per frame
    });

    render(<Enhanced3DViewport />);

    // Simulate viewport interactions
    await userEvent.hover(screen.getByRole('canvas'));
    await waitFor(() => {
      expect(performanceObserver.takeRecords()).toBeDefined();
    });
  });
});
```

## Conclusion

This enhanced UI/UX design system transforms BrepFlow Studio into a professional CAD application that can compete with industry leaders. The implementation focuses on:

1. **Professional Visual Design** - Engineering-focused aesthetics
2. **Enhanced User Experience** - Intuitive workflows and interactions
3. **Accessibility Compliance** - WCAG 2.1 AA standards
4. **Performance Optimization** - Smooth 60fps interactions
5. **Maintainable Architecture** - Modular, type-safe components

Follow this guide systematically to achieve a professional CAD-grade interface that will delight users and establish BrepFlow as a serious contender in the parametric CAD space.
