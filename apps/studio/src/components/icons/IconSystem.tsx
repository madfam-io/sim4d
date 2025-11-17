import React from 'react';
import {
  // Geometry icons
  Box,
  Circle,
  Square,
  Move,
  RotateCw,
  Scale,
  FlipHorizontal,
  // Sketch icons
  Pencil,
  RectangleHorizontal,
  Spline,
  // Boolean operations
  Plus,
  Minus,
  X,
  // Features
  CornerDownRight,
  Scissors,
  Layers,
  TrendingDown,
  // Transform
  Move3d,
  RotateCcw,
  Copy,
  // File operations
  Upload,
  Download,
  Save,
  FolderOpen,
  // UI controls
  Play,
  Pause,
  Square as Stop,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  // Status
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  // Measurement
  Ruler,
  Triangle,
  Calculator,
  CircleDot,
  // Navigation
  Grid3X3,
  Layers3,
  Palette,
  Lightbulb,
  // Additional icons for error fixing
  Loader,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sun,
  MoreVertical,
  Mail,
  Activity,
  Zap,
  Menu,
  Folder,
  HelpCircle,
  StopCircle,
  RotateCcw as Rotate3d,
  Maximize,
  // Viewport layout icons
  Columns,
  Rows,
  LayoutGrid,
  Link,
  Lock,
  Image,
  Camera,
  Monitor,
  // Additional icons from common/Icon.tsx
  RefreshCw,
  Info,
  FileText,
  Trash,
  Cylinder,
  TrendingUp as Sweep,
  CornerDownRight as Fillet,
  FlipHorizontal as Mirror,
  Grid as Pattern,
  Loader as Loading,
  AlertTriangle,
  SquareStack,
  RotateCcw as Undo,
  RotateCw as Redo,
  Unlink,
} from 'lucide-react';
import { clsx } from 'clsx';
import { createChildLogger } from '../../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'IconSystem' });

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

// Professional icon mapping for all BrepFlow operations
export const IconMap = {
  // Node Categories - Sketch
  'Sketch::Line': Pencil,
  'Sketch::Circle': Circle,
  'Sketch::Rectangle': RectangleHorizontal,
  'Sketch::Arc': Circle,
  'Sketch::Spline': Spline,
  'Sketch::Point': Square,
  'Sketch::Polygon': RectangleHorizontal,

  // Node Categories - Solid
  'Solid::Extrude': CornerDownRight,
  'Solid::Revolve': RotateCw,
  'Solid::Sweep': Move3d,
  'Solid::Loft': Layers,
  'Solid::Box': Box,
  'Solid::Cylinder': Circle,
  'Solid::Sphere': Circle,
  'Solid::Cone': Triangle,
  'Solid::Torus': Circle,

  // Node Categories - Boolean
  'Boolean::Union': Plus,
  'Boolean::Subtract': Minus,
  'Boolean::Intersect': X,
  'Boolean::Difference': Minus,
  'Boolean::XOR': XCircle,

  // Node Categories - Features
  'Features::Fillet': CornerDownRight,
  'Features::Chamfer': Scissors,
  'Features::Shell': Layers,
  'Features::Draft': TrendingDown,
  'Features::Hole': Circle,
  'Features::Thread': RotateCw,
  'Features::Pattern': Copy,

  // Node Categories - Transform
  'Transform::Move': Move,
  'Transform::Rotate': RotateCw,
  'Transform::Scale': Scale,
  'Transform::Mirror': FlipHorizontal,
  'Transform::LinearArray': Copy,
  'Transform::CircularArray': RotateCcw,
  'Transform::Matrix': Grid3X3,

  // Node Categories - I/O
  'IO::ImportSTEP': Upload,
  'IO::ExportSTEP': Download,
  'IO::ExportSTL': Download,
  'IO::ImportIGES': Upload,
  'IO::ExportIGES': Download,
  'IO::ImportOBJ': Upload,
  'IO::ExportOBJ': Download,

  // Node Categories - Analysis
  'Analysis::Volume': Calculator,
  'Analysis::Area': Square,
  'Analysis::Length': Ruler,
  'Analysis::Mass': Scale,
  'Analysis::CenterOfMass': Move,
  'Analysis::BoundingBox': Box,

  // Toolbar Actions
  evaluate: Play,
  pause: Pause,
  stop: Stop,
  import: Upload,
  export: Download,
  save: Save,
  open: FolderOpen,
  clear: Trash2,
  settings: Settings,

  // Viewport Controls
  'zoom-in': ZoomIn,
  'zoom-out': ZoomOut,
  'fit-view': Maximize2,
  'toggle-grid': Grid3X3,
  'toggle-wireframe': Layers3,
  'toggle-shaded': Palette,
  'toggle-visibility': Eye,
  hide: EyeOff,

  // Node Status
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  computing: Clock,

  // Measurement Tools
  'measure-distance': Ruler,
  'measure-angle': Triangle,
  'measure-radius': CircleDot,
  'measure-area': Calculator,
  visibility: Eye,

  // UI Elements
  help: Lightbulb,
  info: AlertCircle,
  ruler: Ruler,

  // Additional UI icons
  loader: Loader,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  sun: Sun,
  'more-vertical': MoreVertical,
  mail: Mail,
  activity: Activity,
  zap: Zap,
  menu: Menu,
  folder: Folder,
  'help-circle': HelpCircle,
  'stop-circle': StopCircle,
  'rotate-3d': Rotate3d,
  maximize: Maximize,
  'alert-circle': AlertCircle,
  close: X,
  x: X,
  copy: Copy,
  'trash-2': Trash2,
  eye: Eye,
  move: Move,
  'grid-3x3': Grid3X3,
  scissors: Scissors,
  layers: Layers,
  triangle: Triangle,
  circle: Circle,
  download: Download,
  play: Play,

  // Viewport layout icons
  columns: Columns,
  rows: Rows,
  'layout-grid': LayoutGrid,
  link: Link,
  lock: Lock,
  image: Image,
  camera: Camera,
  monitor: Monitor,

  // Additional missing icons
  upload: Upload,
  template: SquareStack,
  check: CheckCircle,
  code: FileText,
  undo: Undo,
  redo: Redo,
  'folder-open': FolderOpen,
  'refresh-cw': RefreshCw,
  square: Square,
  box: Box,
  unlink: Unlink,
  sphere: Circle, // Using Circle as fallback for sphere
} as const;

export type IconName = keyof typeof IconMap;

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  className,
  strokeWidth = 2,
  ...rest
}) => {
  const IconComponent = IconMap[name as IconName];

  if (!IconComponent) {
    // Only warn in development - production uses fallback icon silently
    if (import.meta.env['DEV']) {
      logger.warn(`Icon "${name}" not found in IconMap - using fallback`);
    }
    return (
      <AlertCircle
        size={size}
        className={clsx('icon', className)}
        strokeWidth={strokeWidth}
        {...rest}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={clsx('icon', className)}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
};

// Convenience components for common use cases
export const NodeIcon: React.FC<{ nodeType: string; size?: number; className?: string }> = ({
  nodeType,
  size = 16,
  className,
}) => {
  return <Icon name={nodeType} size={size} className={clsx('node-icon', className)} />;
};

export const ToolbarIcon: React.FC<{ action: string; size?: number; className?: string }> = ({
  action,
  size = 16,
  className,
}) => {
  return <Icon name={action} size={size} className={clsx('toolbar-icon', className)} />;
};

export const StatusIcon: React.FC<{
  status: 'success' | 'warning' | 'error' | 'computing';
  size?: number;
  className?: string;
}> = ({ status, size = 16, className }) => {
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    computing: 'text-info',
  };

  return (
    <Icon
      name={status}
      size={size}
      className={clsx('status-icon', statusColors[status], className)}
    />
  );
};
