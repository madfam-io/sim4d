# Sim4D Studio UI Component API Documentation

## Overview

The Sim4D Studio UI library provides enterprise-grade components designed specifically for parametric CAD applications. All components follow professional design standards with full TypeScript support, WCAG 2.1 AA accessibility compliance, and optimized performance.

## Core Components

### Button

Professional button system with multiple variants and states.

```typescript
import { Button, IconButton } from '@sim4d/studio/components/ui';
```

#### Button Props

| Prop           | Type                                                            | Default       | Description                    |
| -------------- | --------------------------------------------------------------- | ------------- | ------------------------------ |
| `variant`      | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'danger'` | `'secondary'` | Visual style variant           |
| `size`         | `'sm' \| 'md' \| 'lg'`                                          | `'md'`        | Button size                    |
| `icon`         | `IconName`                                                      | -             | Icon to display                |
| `iconPosition` | `'left' \| 'right'`                                             | `'left'`      | Icon position relative to text |
| `loading`      | `boolean`                                                       | `false`       | Show loading state             |
| `disabled`     | `boolean`                                                       | `false`       | Disable interaction            |
| `fullWidth`    | `boolean`                                                       | `false`       | Expand to full container width |
| `onClick`      | `() => void`                                                    | -             | Click handler                  |

#### IconButton Props

Extends Button props with required `icon` and `aria-label`.

#### Usage Examples

```tsx
// Primary action button
<Button variant="primary" icon="play" onClick={handleEvaluate}>
  Evaluate Graph
</Button>

// Loading state
<Button loading={isProcessing}>
  {isProcessing ? 'Processing...' : 'Process'}
</Button>

// Icon-only button
<IconButton
  icon="settings"
  variant="ghost"
  aria-label="Open settings"
  onClick={openSettings}
/>

// Full width button
<Button fullWidth variant="secondary">
  Import STEP File
</Button>
```

---

### Panel

Collapsible and resizable container system for organizing UI sections.

```typescript
import { Panel, PanelSection } from '@sim4d/studio/components/ui';
```

#### Panel Props

| Prop               | Type                                                               | Default     | Description                       |
| ------------------ | ------------------------------------------------------------------ | ----------- | --------------------------------- |
| `title`            | `string`                                                           | -           | Panel header title                |
| `subtitle`         | `string`                                                           | -           | Secondary header text             |
| `headerActions`    | `ReactNode`                                                        | -           | Actions in header                 |
| `resizable`        | `boolean`                                                          | `false`     | Enable resize handle              |
| `collapsible`      | `boolean`                                                          | `false`     | Enable collapse functionality     |
| `defaultCollapsed` | `boolean`                                                          | `false`     | Initial collapse state            |
| `minWidth`         | `number`                                                           | `240`       | Minimum width (px) when resizable |
| `maxWidth`         | `number`                                                           | `800`       | Maximum width (px) when resizable |
| `variant`          | `'default' \| 'primary' \| 'secondary' \| 'floating' \| 'compact'` | `'default'` | Visual variant                    |
| `onResize`         | `(width: number) => void`                                          | -           | Resize callback                   |
| `onCollapse`       | `(collapsed: boolean) => void`                                     | -           | Collapse state callback           |

#### PanelSection Props

| Prop               | Type        | Default | Description      |
| ------------------ | ----------- | ------- | ---------------- |
| `title`            | `string`    | -       | Section title    |
| `subtitle`         | `string`    | -       | Section subtitle |
| `collapsible`      | `boolean`   | `false` | Enable collapse  |
| `defaultCollapsed` | `boolean`   | `false` | Initial state    |
| `actions`          | `ReactNode` | -       | Section actions  |

#### Usage Examples

```tsx
// Resizable panel
<Panel
  title="Properties"
  subtitle="Node parameters"
  resizable
  minWidth={280}
  maxWidth={480}
  onResize={(width) => console.log('New width:', width)}
>
  <PropertyEditor />
</Panel>

// Collapsible panel with sections
<Panel title="Node Library" collapsible>
  <PanelSection title="Geometry" collapsible>
    <NodeList category="geometry" />
  </PanelSection>
  <PanelSection title="Operations" collapsible defaultCollapsed>
    <NodeList category="operations" />
  </PanelSection>
</Panel>

// Floating panel
<Panel
  variant="floating"
  title="Measurement Tools"
  style={{ position: 'absolute', top: 100, left: 20 }}
>
  <MeasurementTools />
</Panel>
```

---

### Input

Professional form controls with validation and CAD-specific variants.

```typescript
import { Input, NumberInput, CoordinateInput } from '@sim4d/studio/components/ui';
```

#### Input Props

| Prop        | Type                                        | Default     | Description       |
| ----------- | ------------------------------------------- | ----------- | ----------------- |
| `label`     | `string`                                    | -           | Field label       |
| `helpText`  | `string`                                    | -           | Help message      |
| `errorText` | `string`                                    | -           | Error message     |
| `size`      | `'sm' \| 'md' \| 'lg'`                      | `'md'`      | Input size        |
| `variant`   | `'default' \| 'technical' \| 'measurement'` | `'default'` | Visual variant    |
| `leftIcon`  | `IconName`                                  | -           | Icon on left      |
| `rightIcon` | `IconName`                                  | -           | Icon on right     |
| `unit`      | `string`                                    | -           | Unit display      |
| `clearable` | `boolean`                                   | `false`     | Show clear button |
| `loading`   | `boolean`                                   | `false`     | Loading state     |
| `onClear`   | `() => void`                                | -           | Clear callback    |

#### NumberInput Props

Extends Input props with:

| Prop            | Type                                   | Default | Description           |
| --------------- | -------------------------------------- | ------- | --------------------- |
| `min`           | `number`                               | -       | Minimum value         |
| `max`           | `number`                               | -       | Maximum value         |
| `step`          | `number`                               | `1`     | Step increment        |
| `precision`     | `number`                               | -       | Decimal precision     |
| `showSteppers`  | `boolean`                              | `false` | Show up/down buttons  |
| `onValueChange` | `(value: number \| undefined) => void` | -       | Value change callback |

#### CoordinateInput Props

| Prop        | Type                                     | Default                      | Description        |
| ----------- | ---------------------------------------- | ---------------------------- | ------------------ |
| `value`     | `{ x?: number; y?: number; z?: number }` | `{}`                         | 3D coordinates     |
| `onChange`  | `(value: Coordinates) => void`           | -                            | Change callback    |
| `labels`    | `{ x?: string; y?: string; z?: string }` | `{ x: 'X', y: 'Y', z: 'Z' }` | Axis labels        |
| `unit`      | `string`                                 | `'mm'`                       | Unit for all axes  |
| `precision` | `number`                                 | `2`                          | Decimal precision  |
| `disabled`  | `boolean`                                | `false`                      | Disable all inputs |
| `size`      | `'sm' \| 'md' \| 'lg'`                   | `'md'`                       | Input size         |

#### Usage Examples

```tsx
// Basic input with validation
<Input
  label="Project Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  errorText={errors.name}
  required
  clearable
  onClear={() => setName('')}
/>

// Number input with precision
<NumberInput
  label="Width"
  value={width}
  onValueChange={setWidth}
  min={0}
  max={1000}
  step={10}
  precision={2}
  unit="mm"
  variant="measurement"
  showSteppers
/>

// 3D coordinate input
<CoordinateInput
  value={position}
  onChange={setPosition}
  unit="mm"
  precision={1}
/>
```

---

### Enhanced3DViewport

Professional CAD viewport with navigation tools and measurement capabilities.

```typescript
import { Enhanced3DViewport } from '@sim4d/studio/components/viewport';
```

#### ViewportProps

| Prop            | Type                                | Default | Description             |
| --------------- | ----------------------------------- | ------- | ----------------------- |
| `className`     | `string`                            | -       | Additional CSS class    |
| `onToolChange`  | `(toolId: string) => void`          | -       | Tool selection callback |
| `onViewChange`  | `(view: string) => void`            | -       | View change callback    |
| `onMeasurement` | `(type: string, data: any) => void` | -       | Measurement callback    |

#### Available Tools

- **Navigation**: `orbit`, `pan`, `zoom`, `fit`
- **View Modes**: `wireframe`, `shaded`, `xray`
- **Measurement**: `measure-distance`, `measure-angle`, `measure-radius`
- **Other**: `section`, `explode`

#### Keyboard Shortcuts

- `O` - Orbit tool
- `P` - Pan tool
- `Z` - Zoom tool
- `F` - Fit all
- `W` - Wireframe mode
- `S` - Shaded mode
- `X` - X-Ray mode
- `Esc` - Exit measurement tools

#### Usage Example

```tsx
<Enhanced3DViewport
  onToolChange={(tool) => {
    console.log('Selected tool:', tool);
    updateActiveTool(tool);
  }}
  onViewChange={(view) => {
    console.log('View changed to:', view);
    updateCameraView(view);
  }}
  onMeasurement={(type, data) => {
    console.log('Measurement:', type, data);
    addMeasurement({ type, ...data });
  }}
/>
```

---

## Design Tokens

All components use CSS custom properties for consistent theming:

### Color Palettes

```css
/* Engineering Blue (Primary) */
--color-engineering-500: #0891ff;
--color-engineering-600: #0070f3;

/* Technical Gray (Neutral) */
--color-technical-500: #64748b;
--color-technical-600: #4a5568;

/* Precision Orange (Accent) */
--color-precision-500: #f97316;
--color-precision-600: #ea580c;
```

### Component Sizes

```css
/* Buttons */
--button-height-sm: 2rem;
--button-height-md: 2.5rem;
--button-height-lg: 3rem;

/* Inputs */
--input-height-sm: 2rem;
--input-height-md: 2.5rem;
--input-height-lg: 3rem;

/* Panels */
--panel-header-height: 3rem;
--panel-padding: 1rem;
```

---

## Performance Monitoring

Use the built-in performance monitor to track UI performance:

```typescript
import {
  PerformanceMonitor,
  usePerformanceMonitor
} from '@sim4d/studio/utils/performance-monitor';

// React Hook
function MyComponent() {
  const metrics = usePerformanceMonitor();

  return (
    <div>
      FPS: {metrics?.fps}
      Memory: {(metrics?.memory.percentage * 100).toFixed(1)}%
    </div>
  );
}

// Manual monitoring
const monitor = new PerformanceMonitor({
  minFPS: 30,
  maxMemoryUsage: 0.85
});

monitor.start();
monitor.observe((metrics) => {
  console.log('Performance:', metrics);
});
```

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support with tab, arrow keys, and shortcuts
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **High Contrast**: Enhanced borders in high contrast mode

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires ES2020+ support

---

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  ButtonProps,
  IconButtonProps,
  PanelProps,
  PanelSectionProps,
  InputProps,
  NumberInputProps,
  CoordinateInputProps,
  ViewportProps,
  ViewportToolConfig,
  PerformanceMetrics,
} from '@sim4d/studio/components/ui';
```

---

## Best Practices

1. **Performance**: Use `React.memo` for expensive components
2. **Accessibility**: Always provide `aria-label` for icon-only buttons
3. **Validation**: Show clear error messages with recovery hints
4. **Loading States**: Provide feedback during async operations
5. **Responsive Design**: Test components at different viewport sizes
6. **Theme Consistency**: Use design tokens instead of hard-coded values

---

## Testing

Components include comprehensive test coverage:

```bash
# Run component tests
pnpm test:components

# Run integration tests
pnpm test:integration

# Run accessibility tests
pnpm test:a11y
```

---

## Migration Guide

If upgrading from previous UI system:

1. Replace old button classes with Button component
2. Update panel divs to Panel components
3. Convert form inputs to Input/NumberInput
4. Replace custom viewport with Enhanced3DViewport
5. Update CSS variables to new design tokens
6. Test keyboard navigation and accessibility

---

## Support

For issues or questions:

- GitHub Issues: [github.com/aureo-labs/sim4d/issues](https://github.com/aureo-labs/sim4d/issues)
- Documentation: [docs.sim4d.com](https://docs.sim4d.com)
- Discord: [discord.gg/sim4d](https://discord.gg/sim4d)
