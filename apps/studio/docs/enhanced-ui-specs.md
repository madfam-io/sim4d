# Sim4D Studio Enhanced UI/UX Design System

## Executive Summary

This comprehensive design system elevates Sim4D Studio to rival professional CAD applications like SolidWorks, Fusion 360, and Onshape while leveraging web-native advantages. The system emphasizes precision, clarity, and efficient workflows for parametric CAD professionals.

## 1. Visual Design System

### 1.1 Professional Color Schemes

#### Primary Professional Palette

```css
/* Engineering Blue - Primary Brand */
--color-engineering-50: #f0f7ff;
--color-engineering-100: #e0efff;
--color-engineering-200: #bae0ff;
--color-engineering-300: #7cc8ff;
--color-engineering-400: #36abff;
--color-engineering-500: #0891ff; /* Primary */
--color-engineering-600: #0070f3;
--color-engineering-700: #0060df;
--color-engineering-800: #004fb8;
--color-engineering-900: #003d91;

/* Technical Gray - Professional Neutral */
--color-technical-50: #f7f8fa;
--color-technical-100: #eef0f3;
--color-technical-200: #d8dce2;
--color-technical-300: #b3bac5;
--color-technical-400: #8892a3;
--color-technical-500: #64748b; /* Primary Gray */
--color-technical-600: #4a5568;
--color-technical-700: #374151;
--color-technical-800: #1f2937;
--color-technical-900: #111827;

/* Precision Orange - Accent for Measurements */
--color-precision-50: #fff7ed;
--color-precision-100: #ffedd5;
--color-precision-200: #fed7aa;
--color-precision-300: #fdba74;
--color-precision-400: #fb923c;
--color-precision-500: #f97316; /* Precision Accent */
--color-precision-600: #ea580c;
--color-precision-700: #c2410c;
--color-precision-800: #9a3412;
--color-precision-900: #7c2d12;
```

#### CAD-Specific Status Colors

```css
/* Geometry States */
--color-geometry-valid: #10b981; /* Valid geometry */
--color-geometry-invalid: #ef4444; /* Invalid/error geometry */
--color-geometry-pending: #f59e0b; /* Computing/pending */
--color-geometry-preview: #8b5cf6; /* Preview mode */

/* Node States */
--color-node-selected: #0891ff; /* Selected node */
--color-node-executing: #f59e0b; /* Executing node */
--color-node-error: #ef4444; /* Error node */
--color-node-success: #10b981; /* Successfully computed */

/* Connection Types */
--color-connection-shape: #0891ff; /* Shape/geometry connections */
--color-connection-number: #10b981; /* Numeric parameters */
--color-connection-vector: #8b5cf6; /* Vector/coordinate data */
--color-connection-boolean: #f59e0b; /* Boolean operations */
```

#### Dark Theme Professional Variant

```css
/* Dark Mode Engineering Colors */
--color-dark-surface-primary: #0f1419;
--color-dark-surface-secondary: #161b22;
--color-dark-surface-tertiary: #21262d;
--color-dark-surface-quaternary: #30363d;

--color-dark-text-primary: #f0f6fc;
--color-dark-text-secondary: #8b949e;
--color-dark-text-tertiary: #6e7681;

--color-dark-border: #30363d;
--color-dark-border-muted: #21262d;
--color-dark-border-strong: #484f58;
```

### 1.2 Professional Typography System

#### Font Stack

```css
/* Primary UI Font - Technical Precision */
--font-family-ui:
  'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Code/Technical Font - Measurements & Values */
--font-family-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;

/* Display Font - Headers & Branding */
--font-family-display: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Type Scale - Engineering Precision

```css
/* Display Hierarchy */
--font-size-display-xl: 3.75rem; /* 60px - Major headers */
--font-size-display-lg: 3rem; /* 48px - Section headers */
--font-size-display-md: 2.25rem; /* 36px - Panel headers */

/* UI Hierarchy */
--font-size-h1: 1.875rem; /* 30px - Main headings */
--font-size-h2: 1.5rem; /* 24px - Sub headings */
--font-size-h3: 1.25rem; /* 20px - Section headings */
--font-size-h4: 1.125rem; /* 18px - Component headings */

/* Body & Interface */
--font-size-base: 0.875rem; /* 14px - Primary UI text */
--font-size-sm: 0.8125rem; /* 13px - Secondary text */
--font-size-xs: 0.75rem; /* 12px - Labels, captions */
--font-size-xxs: 0.6875rem; /* 11px - Technical annotations */

/* Technical/Measurement Text */
--font-size-technical: 0.8125rem; /* 13px - Coordinates, measurements */
--font-size-code: 0.75rem; /* 12px - Code, node types */
```

#### Weight & Spacing System

```css
/* Professional Weight Hierarchy */
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500; /* Primary UI weight */
--font-weight-semibold: 600; /* Emphasis, headers */
--font-weight-bold: 700; /* Strong emphasis */

/* Letter Spacing for Technical Clarity */
--letter-spacing-tight: -0.01em; /* Display text */
--letter-spacing-normal: 0; /* Body text */
--letter-spacing-wide: 0.025em; /* All caps, labels */
--letter-spacing-technical: 0.01em; /* Technical measurements */

/* Line Heights for Readability */
--line-height-tight: 1.2; /* Headlines */
--line-height-snug: 1.375; /* UI text */
--line-height-base: 1.5; /* Body text */
--line-height-relaxed: 1.625; /* Reading content */
```

### 1.3 Enhanced Shadow System

#### Depth Hierarchy for CAD Interface

```css
/* Surface Elevation System */
--shadow-surface-flat: none;
--shadow-surface-raised: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-surface-elevated: 0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);

/* Component Shadows */
--shadow-panel: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.03);
--shadow-toolbar: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-dropdown: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-modal: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);

/* Interactive Shadows */
--shadow-button: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-button-hover: 0 3px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-button-active: inset 0 1px 2px rgba(0, 0, 0, 0.1);

/* Node & Graph Shadows */
--shadow-node: 0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-node-selected: 0 4px 12px rgba(8, 145, 255, 0.15), 0 2px 6px rgba(8, 145, 255, 0.1);
--shadow-node-error: 0 4px 12px rgba(239, 68, 68, 0.15), 0 2px 6px rgba(239, 68, 68, 0.1);

/* Viewport & 3D Shadows */
--shadow-viewport: inset 0 1px 3px rgba(0, 0, 0, 0.12);
--shadow-viewport-tool: 0 3px 8px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);

/* Focus & Interaction States */
--shadow-focus: 0 0 0 3px rgba(8, 145, 255, 0.12);
--shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.12);
--shadow-focus-success: 0 0 0 3px rgba(16, 185, 129, 0.12);
```

### 1.4 Motion & Animation System

#### Professional Easing Curves

```css
/* CAD Interface Easing */
--ease-precise: cubic-bezier(0.4, 0, 0.2, 1); /* UI interactions */
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Panel transitions */
--ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1); /* Snapping actions */
--ease-technical: cubic-bezier(0.4, 0, 0.6, 1); /* Technical animations */

/* Duration Scale */
--duration-instant: 100ms; /* Micro-interactions */
--duration-fast: 150ms; /* Button states */
--duration-normal: 200ms; /* Panel transitions */
--duration-smooth: 300ms; /* Complex animations */
--duration-slow: 400ms; /* Page transitions */
```

#### Animation Patterns

```css
/* Micro-Interactions */
.anim-button-press {
  transition: transform var(--duration-instant) var(--ease-precise);
}

.anim-button-press:active {
  transform: translateY(1px) scale(0.98);
}

/* Panel Sliding */
.anim-panel-slide {
  transition: transform var(--duration-smooth) var(--ease-smooth);
}

/* Node Connection Animation */
@keyframes connection-flow {
  0% {
    stroke-dashoffset: 10px;
  }
  100% {
    stroke-dashoffset: 0px;
  }
}

/* Geometry Loading Animation */
@keyframes geometry-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

## 2. Component Library Specifications

### 2.1 Button System

#### Primary Button Components

```tsx
// Professional Button Variants
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
}

// Implementation Example
const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  children,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: `
      bg-engineering-500 text-white border-engineering-500
      hover:bg-engineering-600 hover:border-engineering-600
      focus:ring-engineering-500 shadow-button
    `,
    secondary: `
      bg-white text-technical-700 border-technical-300
      hover:bg-technical-50 hover:border-technical-400
      focus:ring-engineering-500 shadow-button
    `,
    // ... other variants
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} />}
          {children}
          {icon && iconPosition === 'right' && <Icon name={icon} />}
        </>
      )}
    </button>
  );
};
```

#### CSS Implementation

```css
/* Professional Button System */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  font-family: var(--font-family-ui);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-decoration: none;
  white-space: nowrap;

  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;

  transition: all var(--duration-fast) var(--ease-precise);

  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-precise);
}

.btn:hover::before {
  opacity: 1;
}

/* Primary Button */
.btn-primary {
  background: var(--color-engineering-500);
  color: white;
  border-color: var(--color-engineering-500);
  box-shadow: var(--shadow-button);
}

.btn-primary:hover {
  background: var(--color-engineering-600);
  border-color: var(--color-engineering-600);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-button-active);
}

/* Technical Secondary Button */
.btn-secondary {
  background: white;
  color: var(--color-technical-700);
  border-color: var(--color-technical-300);
  box-shadow: var(--shadow-button);
}

.btn-secondary:hover {
  background: var(--color-technical-50);
  border-color: var(--color-technical-400);
  box-shadow: var(--shadow-button-hover);
}

/* Button Sizes */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
  height: 2rem;
}

.btn-md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  height: 2.5rem;
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  height: 3rem;
}

/* Icon Integration */
.btn-icon {
  padding: var(--spacing-2);
  width: 2.5rem;
  height: 2.5rem;
}

.btn-icon.btn-sm {
  width: 2rem;
  height: 2rem;
  padding: var(--spacing-1);
}

.btn-icon.btn-lg {
  width: 3rem;
  height: 3rem;
  padding: var(--spacing-3);
}
```

### 2.2 Enhanced Panel System

#### Panel Component Architecture

```tsx
interface PanelProps {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  resizable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  headerActions,
  resizable = false,
  collapsible = false,
  defaultCollapsed = false,
  minWidth = 240,
  maxWidth = 800,
  className = '',
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={`panel ${className} ${isCollapsed ? 'panel-collapsed' : ''}`}
      style={{ minWidth, maxWidth }}
    >
      {title && (
        <div className="panel-header">
          <div className="panel-header-content">
            {collapsible && (
              <button
                className="panel-collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <Icon name={isCollapsed ? 'chevron-right' : 'chevron-down'} />
              </button>
            )}
            <div className="panel-title-group">
              <h3 className="panel-title">{title}</h3>
              {subtitle && <p className="panel-subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerActions && <div className="panel-header-actions">{headerActions}</div>}
        </div>
      )}

      <div className={`panel-content ${isCollapsed ? 'panel-content-collapsed' : ''}`}>
        {children}
      </div>

      {resizable && <div className="panel-resize-handle" />}
    </div>
  );
};
```

#### Professional Panel Styling

```css
/* Professional Panel System */
.panel {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-3);
  background: linear-gradient(
    135deg,
    var(--color-surface-primary) 0%,
    var(--color-surface-secondary) 100%
  );
  border-bottom: 1px solid var(--color-border);
  min-height: var(--panel-header-height);
}

.panel-header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
}

.panel-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-precise);
  cursor: pointer;
}

.panel-collapse-btn:hover {
  background: var(--color-surface-tertiary);
  color: var(--color-text-secondary);
}

.panel-title-group {
  flex: 1;
}

.panel-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.panel-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: var(--spacing-1) 0 0 0;
  line-height: var(--line-height-tight);
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.panel-content {
  flex: 1;
  padding: var(--spacing-4);
  overflow-y: auto;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.panel-content-collapsed {
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

/* Resize Handle */
.panel-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  cursor: col-resize;
  transition: background var(--duration-fast) var(--ease-precise);
}

.panel-resize-handle:hover,
.panel-resize-handle:active {
  background: var(--color-engineering-500);
}

/* Panel Variants */
.panel-primary {
  border-color: var(--color-engineering-200);
}

.panel-primary .panel-header {
  background: linear-gradient(
    135deg,
    var(--color-engineering-50) 0%,
    var(--color-engineering-100) 100%
  );
  border-bottom-color: var(--color-engineering-200);
}

.panel-secondary {
  background: var(--color-surface-secondary);
  border-color: var(--color-border);
}

/* Floating Panel Variant */
.panel-floating {
  position: absolute;
  z-index: var(--z-index-popover);
  box-shadow: var(--shadow-dropdown);
  border-radius: var(--radius-xl);
}

/* Compact Panel Variant */
.panel-compact .panel-header {
  padding: var(--spacing-2) var(--spacing-3);
  min-height: 2.5rem;
}

.panel-compact .panel-content {
  padding: var(--spacing-3);
}

.panel-compact .panel-title {
  font-size: var(--font-size-sm);
}
```

### 2.3 Advanced Form Controls

#### Professional Input System

```css
/* Professional Form Controls */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  letter-spacing: var(--letter-spacing-wide);
}

.form-label.required::after {
  content: '*';
  color: var(--color-error);
  margin-left: var(--spacing-1);
}

.form-input {
  display: flex;
  align-items: center;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  transition: all var(--duration-fast) var(--ease-precise);
  box-shadow: var(--shadow-input);
  min-height: 2.5rem;
}

.form-input:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-input-hover);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-engineering-500);
  box-shadow: var(--shadow-focus);
}

.form-input:disabled {
  background: var(--color-surface-tertiary);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

/* Technical/Numeric Input Styling */
.form-input-technical {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-technical);
  letter-spacing: var(--letter-spacing-technical);
  text-align: right;
}

.form-input-with-unit {
  position: relative;
}

.form-input-with-unit::after {
  content: attr(data-unit);
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

/* Input Groups */
.input-group {
  display: flex;
  align-items: stretch;
}

.input-group .form-input {
  border-radius: 0;
  border-right: none;
}

.input-group .form-input:first-child {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.input-group .form-input:last-child {
  border-right: 1px solid var(--color-border);
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.input-group-addon {
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-left: none;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.input-group-addon:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

/* Select Styling */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right var(--spacing-2) center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Validation States */
.form-input.error {
  border-color: var(--color-error);
  box-shadow: var(--shadow-focus-error);
}

.form-input.success {
  border-color: var(--color-success);
  box-shadow: var(--shadow-focus-success);
}

.form-help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-1);
}

.form-error-text {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--spacing-1);
}
```

## 3. Icon System & Visual Language

### 3.1 Professional Icon Guidelines

#### Icon Design Principles

```typescript
// Icon System Specifications
interface IconProps {
  name: string;
  size?: 12 | 14 | 16 | 20 | 24 | 32;
  variant?: 'line' | 'solid' | 'duotone';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

// CAD-Specific Icon Categories
const CAD_ICONS = {
  // Geometry Creation
  sketch: ['line', 'circle', 'rectangle', 'arc', 'spline', 'polygon'],
  solid: ['extrude', 'revolve', 'sweep', 'loft', 'box', 'cylinder', 'sphere'],
  boolean: ['union', 'subtract', 'intersect', 'shell'],

  // Modification Tools
  features: ['fillet', 'chamfer', 'draft', 'mirror', 'pattern'],
  transform: ['move', 'rotate', 'scale', 'array-linear', 'array-circular'],

  // View & Navigation
  view: ['zoom-fit', 'zoom-in', 'zoom-out', 'pan', 'orbit', 'wireframe', 'shaded'],
  orientation: ['iso', 'front', 'back', 'left', 'right', 'top', 'bottom'],

  // Measurement & Analysis
  measure: ['distance', 'angle', 'radius', 'area', 'volume', 'center-of-mass'],

  // File Operations
  file: ['new', 'open', 'save', 'import', 'export', 'step', 'stl', 'iges'],

  // Interface
  ui: ['settings', 'layers', 'materials', 'lighting', 'grid', 'snap'],
};
```

#### Icon Implementation

```css
/* Professional Icon System */
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  user-select: none;
}

.icon-12 {
  width: 0.75rem;
  height: 0.75rem;
}
.icon-14 {
  width: 0.875rem;
  height: 0.875rem;
}
.icon-16 {
  width: 1rem;
  height: 1rem;
}
.icon-20 {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-24 {
  width: 1.5rem;
  height: 1.5rem;
}
.icon-32 {
  width: 2rem;
  height: 2rem;
}

/* Icon Color Variants */
.icon-primary {
  color: var(--color-text-primary);
}
.icon-secondary {
  color: var(--color-text-secondary);
}
.icon-tertiary {
  color: var(--color-text-tertiary);
}
.icon-accent {
  color: var(--color-engineering-500);
}
.icon-success {
  color: var(--color-success);
}
.icon-warning {
  color: var(--color-warning);
}
.icon-error {
  color: var(--color-error);
}

/* Icon Button Integration */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-precise);
  cursor: pointer;
}

.btn-icon:hover {
  background: var(--color-surface-tertiary);
  color: var(--color-text-primary);
}

.btn-icon:active {
  background: var(--color-surface-quaternary);
  transform: scale(0.95);
}

.btn-icon.active {
  background: var(--color-engineering-100);
  color: var(--color-engineering-600);
  border-color: var(--color-engineering-200);
}
```

### 3.2 Node Visual System

#### Enhanced Node Styling

```css
/* Professional Node Editor */
.custom-node {
  position: relative;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  min-width: var(--node-min-width);
  font-family: var(--font-family-ui);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-precise);
}

.node-container {
  position: relative;
  background: var(--color-surface-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--node-border-radius);
  padding: var(--node-padding);
  min-height: var(--node-min-height);
  box-shadow: var(--shadow-node);
  transition: all var(--duration-fast) var(--ease-precise);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

/* Node States */
.custom-node.selected .node-container {
  border-color: var(--color-engineering-500);
  background: var(--color-engineering-50);
  box-shadow: var(--shadow-node-selected);
  transform: translateY(-1px);
}

.custom-node.executing .node-container {
  border-color: var(--color-warning);
  background: var(--color-warning-50);
  position: relative;
}

.custom-node.executing .node-container::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid var(--color-warning);
  border-radius: inherit;
  animation: pulse-border 1.5s ease-in-out infinite;
}

.custom-node.error .node-container {
  border-color: var(--color-error);
  background: var(--color-error-50);
  box-shadow: var(--shadow-node-error);
  animation: shake 0.5s ease-in-out;
}

.custom-node:hover .node-container {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

/* Node Content */
.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-precise);
}

.custom-node.selected .node-icon {
  background: var(--color-engineering-100);
  color: var(--color-engineering-600);
}

.node-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
  line-height: var(--line-height-tight);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-category {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin-top: var(--spacing-1);
}

/* Status Indicators */
.node-status-indicator {
  position: absolute;
  top: var(--spacing-1);
  right: var(--spacing-1);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  border: 2px solid var(--color-surface-primary);
  transition: all var(--duration-fast) var(--ease-precise);
}

.node-status-indicator.error {
  background: var(--color-error);
  box-shadow: 0 0 8px var(--color-error);
}

.node-status-indicator.executing {
  background: var(--color-warning);
  animation: pulse 1s infinite;
}

/* Connection Handles */
.react-flow__handle {
  width: 12px;
  height: 12px;
  background: var(--color-border-strong);
  border: 2px solid var(--color-surface-primary);
  border-radius: 50%;
  transition: all var(--duration-fast) var(--ease-precise);
}

.react-flow__handle:hover {
  width: 16px;
  height: 16px;
  background: var(--color-engineering-500);
  box-shadow: 0 0 0 4px var(--color-engineering-100);
  transform: translate(-2px, -2px);
}

.react-flow__handle.connecting {
  width: 16px;
  height: 16px;
  background: var(--color-engineering-500);
  box-shadow: 0 0 0 6px var(--color-engineering-100);
  transform: translate(-2px, -2px);
}

/* Handle Type Colors */
.react-flow__handle.handle-shape {
  background: var(--color-connection-shape);
}

.react-flow__handle.handle-number {
  background: var(--color-connection-number);
}

.react-flow__handle.handle-vector {
  background: var(--color-connection-vector);
}

.react-flow__handle.handle-boolean {
  background: var(--color-connection-boolean);
}

/* Node Preview Tooltip */
.node-preview {
  position: absolute;
  bottom: calc(100% + var(--spacing-2));
  left: 50%;
  transform: translateX(-50%);

  background: var(--color-surface-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  box-shadow: var(--shadow-dropdown);

  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
  white-space: nowrap;
  z-index: var(--z-index-tooltip);

  opacity: 0;
  animation: fadeInUp var(--duration-fast) var(--ease-out) forwards;
}

.node-preview::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--color-surface-primary);
}

/* Node Animations */
@keyframes pulse-border {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

## 4. Advanced Layout System

### 4.1 Professional Workspace Layout

#### Responsive Grid System

```css
/* Professional Workspace Grid */
.workbench-layout {
  display: grid;
  grid-template-areas:
    'toolbar toolbar toolbar'
    'sidebar main-content inspector'
    'sidebar console inspector';
  grid-template-columns: var(--width-sidebar) 1fr var(--width-inspector);
  grid-template-rows: var(--toolbar-height) 1fr auto;
  height: 100vh;
  width: 100vw;
  gap: 1px;
  background: var(--color-border);
}

.workbench-toolbar {
  grid-area: toolbar;
  background: var(--color-surface-primary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-2);
  box-shadow: var(--shadow-toolbar);
}

.workbench-sidebar {
  grid-area: sidebar;
  background: var(--color-surface-primary);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.workbench-main {
  grid-area: main-content;
  background: var(--color-surface-secondary);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.workbench-inspector {
  grid-area: inspector;
  background: var(--color-surface-primary);
  border-left: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.workbench-console {
  grid-area: console;
  background: var(--color-surface-primary);
  border-top: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .workbench-layout {
    grid-template-areas:
      'toolbar toolbar'
      'main-content inspector'
      'console console';
    grid-template-columns: 1fr var(--width-inspector);
    grid-template-rows: var(--toolbar-height) 1fr auto;
  }

  .workbench-sidebar {
    position: absolute;
    left: -280px;
    top: var(--toolbar-height);
    bottom: 0;
    width: var(--width-sidebar);
    z-index: var(--z-index-modal);
    box-shadow: var(--shadow-dropdown);
    transition: left var(--duration-smooth) var(--ease-smooth);
  }

  .workbench-sidebar.open {
    left: 0;
  }
}

@media (max-width: 768px) {
  .workbench-layout {
    grid-template-areas:
      'toolbar'
      'main-content'
      'console';
    grid-template-columns: 1fr;
    grid-template-rows: var(--toolbar-height) 1fr auto;
  }

  .workbench-inspector {
    position: absolute;
    right: -320px;
    top: var(--toolbar-height);
    bottom: 0;
    width: var(--width-inspector);
    z-index: var(--z-index-modal);
    box-shadow: var(--shadow-dropdown);
    transition: right var(--duration-smooth) var(--ease-smooth);
  }

  .workbench-inspector.open {
    right: 0;
  }
}
```

### 4.2 Advanced Panel Management

#### Resizable Panel System

```typescript
// Advanced Panel Management
interface PanelLayoutConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  resizable: boolean;
  collapsible: boolean;
  position: 'left' | 'right' | 'top' | 'bottom' | 'center';
  order: number;
}

const PANEL_CONFIGS: PanelLayoutConfig[] = [
  {
    id: 'node-panel',
    title: 'Node Library',
    component: NodePanel,
    defaultSize: 280,
    minSize: 240,
    maxSize: 400,
    resizable: true,
    collapsible: true,
    position: 'left',
    order: 1,
  },
  {
    id: 'viewport-3d',
    title: '3D Viewport',
    component: Viewport3D,
    defaultSize: 60,
    minSize: 30,
    maxSize: 80,
    resizable: true,
    collapsible: false,
    position: 'center',
    order: 1,
  },
  {
    id: 'node-editor',
    title: 'Node Editor',
    component: NodeEditor,
    defaultSize: 40,
    minSize: 20,
    maxSize: 70,
    resizable: true,
    collapsible: false,
    position: 'center',
    order: 2,
  },
  {
    id: 'inspector',
    title: 'Properties',
    component: Inspector,
    defaultSize: 320,
    minSize: 280,
    maxSize: 480,
    resizable: true,
    collapsible: true,
    position: 'right',
    order: 1,
  },
  {
    id: 'console',
    title: 'Console',
    component: Console,
    defaultSize: 150,
    minSize: 100,
    maxSize: 300,
    resizable: true,
    collapsible: true,
    position: 'bottom',
    order: 1,
  },
];
```

#### Panel State Management

```css
/* Advanced Panel Transitions */
.panel-container {
  position: relative;
  transition: all var(--duration-smooth) var(--ease-smooth);
  overflow: hidden;
}

.panel-container.collapsing {
  overflow: hidden;
}

.panel-container.collapsed {
  min-width: 0 !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.panel-container.expanding {
  animation: expand var(--duration-smooth) var(--ease-smooth);
}

/* Panel Resize Handles */
.resize-handle {
  position: absolute;
  background: transparent;
  z-index: var(--z-index-sticky);
  transition: background var(--duration-fast) var(--ease-precise);
}

.resize-handle.horizontal {
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
}

.resize-handle.horizontal.left {
  left: -2px;
}

.resize-handle.horizontal.right {
  right: -2px;
}

.resize-handle.vertical {
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
}

.resize-handle.vertical.top {
  top: -2px;
}

.resize-handle.vertical.bottom {
  bottom: -2px;
}

.resize-handle:hover,
.resize-handle.active {
  background: var(--color-engineering-500);
}

.resize-handle.horizontal:hover::after,
.resize-handle.horizontal.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 20px;
  background: white;
  border-radius: 2px;
}

.resize-handle.vertical:hover::after,
.resize-handle.vertical.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 3px;
  background: white;
  border-radius: 2px;
}

/* Panel Animations */
@keyframes expand {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: var(--panel-target-width);
    opacity: 1;
  }
}

@keyframes collapse {
  from {
    width: var(--panel-current-width);
    opacity: 1;
  }
  to {
    width: 0;
    opacity: 0;
  }
}
```

## 5. 3D Viewport Enhancement

### 5.1 Professional 3D Interface

#### Enhanced Viewport Controls

```css
/* Professional 3D Viewport */
.viewport-3d {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-neutral-900);
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-viewport);
}

.viewport-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.viewport-canvas:active {
  cursor: grabbing;
}

/* Enhanced Viewport Toolbar */
.viewport-toolbar {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-viewport-tool);
  z-index: 10;
}

.viewport-toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 0 var(--spacing-1);
}

.viewport-toolbar-group:not(:last-child)::after {
  content: '';
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 var(--spacing-2);
}

.viewport-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-precise);
  position: relative;
}

.viewport-tool-btn:hover {
  background: var(--color-surface-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.viewport-tool-btn.active {
  background: var(--color-engineering-100);
  color: var(--color-engineering-600);
  border-color: var(--color-engineering-200);
}

.viewport-tool-btn.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: var(--color-engineering-500);
  border-radius: 50%;
}

/* Navigation Cube */
.navigation-cube {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  width: 100px;
  height: 100px;
  z-index: 20;
  perspective: 600px;
  user-select: none;
}

.cube-container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--duration-smooth) var(--ease-smooth);
}

.cube-face {
  position: absolute;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-precise);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
}

.cube-face:hover {
  background: var(--color-engineering-100);
  border-color: var(--color-engineering-300);
  color: var(--color-engineering-700);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.cube-face.front {
  transform: translate3d(35px, 35px, 15px);
}
.cube-face.back {
  transform: translate3d(35px, 35px, -15px) rotateY(180deg);
}
.cube-face.right {
  transform: translate3d(50px, 35px, 0) rotateY(90deg);
}
.cube-face.left {
  transform: translate3d(20px, 35px, 0) rotateY(-90deg);
}
.cube-face.top {
  transform: translate3d(35px, 20px, 0) rotateX(90deg);
}
.cube-face.bottom {
  transform: translate3d(35px, 50px, 0) rotateX(-90deg);
}

/* Coordinate Display */
.coordinate-display {
  position: absolute;
  bottom: var(--spacing-3);
  right: var(--spacing-3);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-viewport-tool);
  z-index: 10;
}

.coordinate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-1);
}

.coordinate-item:last-child {
  margin-bottom: 0;
}

.coord-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  min-width: 12px;
  text-align: center;
}

.coord-value {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-technical);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  background: var(--color-surface-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  min-width: 60px;
  text-align: right;
  border: 1px solid var(--color-border);
}

/* Scale Indicator */
.scale-indicator {
  position: absolute;
  bottom: var(--spacing-3);
  left: var(--spacing-3);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2) var(--spacing-3);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-viewport-tool);
  z-index: 10;
}

.scale-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-1);
}

.scale-line {
  width: 50px;
  height: 2px;
  background: var(--color-text-primary);
  position: relative;
}

.scale-line::before,
.scale-line::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 8px;
  background: var(--color-text-primary);
  top: -3px;
}

.scale-line::before {
  left: 0;
}
.scale-line::after {
  right: 0;
}

.scale-label {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.grid-info {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-align: center;
}

/* Performance Monitor */
.performance-monitor {
  position: absolute;
  top: 100px;
  left: var(--spacing-3);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2);
  backdrop-filter: blur(8px);
  color: white;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  z-index: 5;
  min-width: 120px;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-1);
}

.perf-item:last-child {
  margin-bottom: 0;
}

.perf-label {
  color: rgba(255, 255, 255, 0.7);
}

.perf-value {
  color: var(--color-warning-400);
  font-weight: var(--font-weight-semibold);
}

.perf-value.good {
  color: var(--color-success-400);
}

.perf-value.bad {
  color: var(--color-error-400);
}
```

### 5.2 Advanced Measurement Tools

#### Professional Measurement Interface

```css
/* Professional Measurement Panel */
.measurement-panel {
  position: absolute;
  top: 80px;
  left: var(--spacing-3);
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-dropdown);
  z-index: 30;
  overflow: hidden;
  animation: slideInLeft var(--duration-smooth) var(--ease-smooth);
}

.measurement-header {
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(
    135deg,
    var(--color-surface-primary) 0%,
    var(--color-surface-secondary) 100%
  );
}

.measurement-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.measurement-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.measurement-tools {
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-2);
}

.measurement-tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-3);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-precise);
  text-align: center;
}

.measurement-tool-btn:hover {
  background: var(--color-surface-tertiary);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.measurement-tool-btn.active {
  background: var(--color-engineering-100);
  border-color: var(--color-engineering-300);
  color: var(--color-engineering-700);
}

.tool-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
}

.measurement-tool-btn.active .tool-icon {
  color: var(--color-engineering-600);
}

.tool-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.measurements-list {
  max-height: 300px;
  overflow-y: auto;
}

.measurements-header {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.measurements-header h4 {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin: 0;
}

.measurement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
  transition: background var(--duration-fast) var(--ease-precise);
}

.measurement-item:hover {
  background: var(--color-surface-secondary);
}

.measurement-item:last-child {
  border-bottom: none;
}

.measurement-info {
  flex: 1;
}

.measurement-type {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: capitalize;
  margin-bottom: var(--spacing-1);
}

.measurement-value {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.measurement-unit {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-left: var(--spacing-1);
}

.measurement-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.measurement-action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-precise);
}

.measurement-action-btn:hover {
  background: var(--color-surface-tertiary);
  color: var(--color-text-secondary);
}

.measurement-action-btn.delete:hover {
  background: var(--color-error-100);
  color: var(--color-error-600);
}

/* Empty State */
.measurements-empty {
  padding: var(--spacing-6);
  text-align: center;
  color: var(--color-text-tertiary);
}

.measurements-empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--spacing-3);
  opacity: 0.5;
}

.measurements-empty-text {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-1);
}

.measurements-empty-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-quaternary);
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .measurement-panel {
    width: calc(100vw - var(--spacing-6));
    left: var(--spacing-3);
    right: var(--spacing-3);
  }

  .tool-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .measurement-tool-btn {
    padding: var(--spacing-2);
  }

  .tool-icon {
    width: 20px;
    height: 20px;
  }
}
```

This comprehensive design system specification provides professional CAD-grade UI/UX that rivals SolidWorks, Fusion 360, and Onshape while leveraging web-native advantages. The system emphasizes:

1. **Professional Visual Identity** - Engineering-focused color palette and typography
2. **Precision Interface Design** - Technical measurements, coordinates, and professional layout
3. **Advanced Component Library** - Comprehensive buttons, panels, forms optimized for CAD workflows
4. **Enhanced 3D Viewport** - Professional navigation, measurement tools, and performance monitoring
5. **Responsive Layout System** - Adaptive workspace management for various screen sizes
6. **Accessibility & Performance** - WCAG compliance, optimized animations, and efficient rendering

The design system builds upon Sim4D's existing foundation while delivering the polish and functionality expected by CAD professionals. All components are implementation-ready with detailed CSS specifications and React TypeScript interfaces.
