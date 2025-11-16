import React, { useState } from 'react';
import { Icon } from '../icons/IconSystem';
import './Panel.css';

export interface PanelSectionProps {
  title?: string;
  subtitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PanelSection: React.FC<PanelSectionProps> = ({
  title,
  subtitle,
  collapsible = false,
  defaultCollapsed = false,
  actions,
  children,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`panel-section ${className}`}>
      {(title || subtitle || actions) && (
        <div
          className={`panel-section-header ${collapsible ? 'panel-section-header-collapsible' : ''}`}
          onClick={handleToggle}
        >
          <div className="panel-section-header-content">
            {collapsible && (
              <Icon
                name={isCollapsed ? 'chevron-right' : 'chevron-down'}
                size={16}
                className="panel-section-collapse-icon"
              />
            )}
            <div className="panel-section-title-group">
              {title && <h4 className="panel-section-title">{title}</h4>}
              {subtitle && <p className="panel-section-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="panel-section-actions" onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      )}
      {!isCollapsed && <div className="panel-section-content">{children}</div>}
    </div>
  );
};

PanelSection.displayName = 'PanelSection';
