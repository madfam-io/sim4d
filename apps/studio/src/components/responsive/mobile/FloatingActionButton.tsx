import React, { useState, useRef, useEffect } from 'react';
import './FloatingActionButton.css';

interface FABAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  expanded: boolean;
  onToggle: () => void;
  hidden?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  expanded,
  onToggle,
  hidden = false,
  position = 'bottom-right',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Handle animation timing
  useEffect(() => {
    if (expanded) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [expanded, onToggle]);

  if (hidden) return null;

  return (
    <>
      {expanded && <div className="fab-backdrop" onClick={onToggle} />}
      <div
        ref={fabRef}
        className={`floating-action-button ${position} ${expanded ? 'expanded' : ''}`}
      >
        {expanded && (
          <div className={`fab-actions ${isAnimating ? 'animating' : ''}`}>
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="fab-action-item"
                style={{
                  animationDelay: `${index * 50}ms`,
                  backgroundColor: action.color,
                }}
              >
                <span className="fab-action-label">{action.label}</span>
                <button
                  className="fab-action-button"
                  onClick={() => {
                    action.action();
                    onToggle();
                  }}
                  aria-label={action.label}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className={`fab-main ${expanded ? 'active' : ''}`}
          onClick={onToggle}
          aria-label={expanded ? 'Close actions' : 'Open actions'}
        >
          <span className="fab-icon">{expanded ? '✕' : '+'}</span>
        </button>
      </div>
    </>
  );
};
