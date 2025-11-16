import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/IconSystem';
import { IconButton } from './Button';
import './Panel.css';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  resizable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  minWidth?: number;
  maxWidth?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'floating' | 'compact';
  children: React.ReactNode;
  onResize?: (width: number) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      title,
      subtitle,
      headerActions,
      resizable = false,
      collapsible = false,
      defaultCollapsed = false,
      minWidth = 240,
      maxWidth = 800,
      variant = 'default',
      className = '',
      children,
      onResize,
      onCollapse,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState<number | undefined>();
    const panelRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);

    const handleCollapse = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };

    // Resize functionality
    useEffect(() => {
      if (!resizable || !resizeHandleRef.current) return;

      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const startX = e.clientX;
        const startWidth = panelRef.current?.offsetWidth || minWidth;

        const handleMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
          setWidth(newWidth);
          onResize?.(newWidth);
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      const handle = resizeHandleRef.current;
      handle.addEventListener('mousedown', handleMouseDown);

      return () => {
        handle?.removeEventListener('mousedown', handleMouseDown);
      };
    }, [resizable, minWidth, maxWidth, onResize]);

    const panelClasses = [
      'panel',
      `panel-${variant}`,
      isCollapsed && 'panel-collapsed',
      isResizing && 'panel-resizing',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const hasHeader = title || subtitle || headerActions || collapsible;

    return (
      <div
        ref={ref}
        className={panelClasses}
        style={{
          width,
          minWidth,
          maxWidth,
        }}
        {...props}
      >
        <div ref={panelRef} className="panel-container">
          {hasHeader && (
            <div className="panel-header">
              <div className="panel-header-content">
                {collapsible && (
                  <IconButton
                    icon={isCollapsed ? 'chevron-right' : 'chevron-down'}
                    size="sm"
                    variant="ghost"
                    className="panel-collapse-btn"
                    onClick={handleCollapse}
                    aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                  />
                )}

                {(title || subtitle) && (
                  <div className="panel-title-group">
                    {title && <h3 className="panel-title">{title}</h3>}
                    {subtitle && <p className="panel-subtitle">{subtitle}</p>}
                  </div>
                )}
              </div>

              {headerActions && <div className="panel-header-actions">{headerActions}</div>}
            </div>
          )}

          <div className={`panel-content ${isCollapsed ? 'panel-content-collapsed' : ''}`}>
            {children}
          </div>
        </div>

        {resizable && (
          <div ref={resizeHandleRef} className="panel-resize-handle" aria-label="Resize panel" />
        )}
      </div>
    );
  }
);

Panel.displayName = 'Panel';

// Panel Section Component for organizing content within panels
export interface PanelSectionProps {
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const PanelSection: React.FC<PanelSectionProps> = ({
  title,
  subtitle,
  collapsible = false,
  defaultCollapsed = false,
  actions,
  className = '',
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const sectionClasses = ['panel-section', isCollapsed && 'panel-section-collapsed', className]
    .filter(Boolean)
    .join(' ');

  const hasHeader = title || subtitle || actions || collapsible;

  return (
    <div className={sectionClasses}>
      {hasHeader && (
        <div className="panel-section-header">
          <div className="panel-section-header-content">
            {collapsible && (
              <IconButton
                icon={isCollapsed ? 'chevron-right' : 'chevron-down'}
                size="sm"
                variant="ghost"
                className="panel-section-collapse-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
              />
            )}

            {(title || subtitle) && (
              <div className="panel-section-title-group">
                {title && <h4 className="panel-section-title">{title}</h4>}
                {subtitle && <p className="panel-section-subtitle">{subtitle}</p>}
              </div>
            )}
          </div>

          {actions && <div className="panel-section-actions">{actions}</div>}
        </div>
      )}

      <div
        className={`panel-section-content ${isCollapsed ? 'panel-section-content-collapsed' : ''}`}
      >
        {children}
      </div>
    </div>
  );
};
