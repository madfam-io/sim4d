import React, { useState, useRef, useEffect } from 'react';
import './MobileSplitView.css';

export type SplitMode = 'single' | 'split-horizontal' | 'split-vertical' | 'overlay';

interface MobileSplitViewProps {
  mode: SplitMode;
  onModeChange?: (mode: SplitMode) => void;
  primaryContent?: React.ReactNode;
  secondaryContent?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  splitRatio?: number;
}

export const MobileSplitView: React.FC<MobileSplitViewProps> = ({
  mode = 'single',
  onModeChange,
  primaryContent,
  secondaryContent,
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  splitRatio = 0.5,
}) => {
  const [actualRatio, setActualRatio] = useState(splitRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  // Handle divider drag for resizing panels
  useEffect(() => {
    if (mode === 'single' || !dividerRef.current) return;

    let startPos = 0;
    let startRatio = actualRatio;

    const handleStart = (e: TouchEvent | MouseEvent) => {
      setIsDragging(true);
      const pos = 'touches' in e ? e.touches[0] : e;
      startPos = mode === 'split-horizontal' ? pos.clientX : pos.clientY;
      startRatio = actualRatio;
      e.preventDefault();
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const pos = 'touches' in e ? e.touches[0] : e;
      const container = containerRef.current.getBoundingClientRect();

      let delta: number;
      let totalSize: number;

      if (mode === 'split-horizontal') {
        delta = pos.clientX - startPos;
        totalSize = container.width;
      } else {
        delta = pos.clientY - startPos;
        totalSize = container.height;
      }

      const deltaRatio = delta / totalSize;
      const newRatio = Math.max(0.2, Math.min(0.8, startRatio + deltaRatio));
      setActualRatio(newRatio);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    const divider = dividerRef.current;

    // Touch events
    divider.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    // Mouse events (for testing in browser)
    divider.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      divider.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      divider.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging, actualRatio, mode]);

  // Note: Orientation handling removed - mode is controlled by MobileLayout
  // which determines optimal split based on device capabilities

  const renderPanel = (content: React.ReactNode, label: string, className: string = '') => {
    if (!content) return null;

    return (
      <div className={`split-panel ${className}`}>
        {mode !== 'single' && (
          <div className="split-panel-header">
            <span className="panel-title">{label}</span>
          </div>
        )}
        <div className="split-panel-content">{content}</div>
      </div>
    );
  };

  // Single panel mode
  if (mode === 'single') {
    return (
      <div className="mobile-split-view single-mode">
        {renderPanel(primaryContent, primaryLabel, 'panel-full')}
      </div>
    );
  }

  // Overlay mode (secondary panel floats over primary)
  if (mode === 'overlay' && secondaryContent) {
    return (
      <div className="mobile-split-view overlay-mode">
        {renderPanel(primaryContent, primaryLabel, 'panel-primary')}
        <div className="panel-overlay">
          {renderPanel(secondaryContent, secondaryLabel, 'panel-secondary')}
        </div>
      </div>
    );
  }

  // Split modes
  const splitClass = mode === 'split-horizontal' ? 'horizontal' : 'vertical';
  const splitStyle =
    mode === 'split-horizontal'
      ? { gridTemplateColumns: `${actualRatio}fr ${1 - actualRatio}fr` }
      : { gridTemplateRows: `${actualRatio}fr ${1 - actualRatio}fr` };

  return (
    <div
      ref={containerRef}
      className={`mobile-split-view split-mode ${splitClass} ${isDragging ? 'dragging' : ''}`}
      style={splitStyle}
    >
      {renderPanel(primaryContent, primaryLabel, 'panel-primary')}

      <div
        ref={dividerRef}
        className="split-divider"
        role="separator"
        aria-orientation={mode === 'split-horizontal' ? 'vertical' : 'horizontal'}
      >
        <div className="divider-handle" />
      </div>

      {secondaryContent && renderPanel(secondaryContent, secondaryLabel, 'panel-secondary')}
    </div>
  );
};
