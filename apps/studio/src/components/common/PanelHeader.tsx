import React from 'react';
import './PanelHeader.css';

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  subtitle,
  actions,
  variant = 'primary',
  size = 'md',
}) => {
  return (
    <div className={`panel-header panel-header--${variant} panel-header--${size}`}>
      <div className="panel-header__content">
        <h3 className="panel-header__title">{title}</h3>
        {subtitle && <p className="panel-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="panel-header__actions">{actions}</div>}
    </div>
  );
};
