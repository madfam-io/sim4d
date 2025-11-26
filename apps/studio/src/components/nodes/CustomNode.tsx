import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { NodeIcon } from '../icons/IconSystem';
import type { NodeInstance } from '@sim4d/types';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    type?: string;
    nodeType?: string;
    nodeData?: NodeInstance;
    isSelected?: boolean;
    isHovered?: boolean;
    hasError?: boolean;
    isExecuting?: boolean;
    onOpenParameterDialog?: (nodeType: string, position: { x: number; y: number }) => void;
  };
  selected?: boolean;
}

export function CustomNode({ id, data, selected }: CustomNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { getNode, setNodes } = useReactFlow();

  const nodeType = data.type || 'Unknown';
  const category = nodeType.split('::')[0] || 'Unknown';
  const operation = nodeType.split('::')[1] || nodeType;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowPreview(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTimeout(() => setShowPreview(false), 300);
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Open parameter dialog for node editing
      if (data.onOpenParameterDialog && data.nodeType) {
        data.onOpenParameterDialog(data.nodeType, { x: e.clientX, y: e.clientY });
      }
    },
    [data]
  );

  // Determine node status
  const isError = data.hasError;
  const isExecuting = data.isExecuting;
  const isSelected = selected || data.isSelected;

  return (
    <div
      className={`custom-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isError ? 'error' : ''} ${isExecuting ? 'executing' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        padding: 0,
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        minWidth: '140px',
        fontSize: '13px',
        fontFamily: 'var(--font-family-ui)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Main node container */}
      <div
        className="node-container"
        style={{
          background: isSelected
            ? 'var(--color-primary-50)'
            : isHovered
              ? 'var(--color-surface-secondary)'
              : 'var(--color-surface-primary)',
          border: `2px solid ${
            isSelected
              ? 'var(--color-primary-500)'
              : isError
                ? 'var(--color-error-500)'
                : isHovered
                  ? 'var(--color-border-strong)'
                  : 'var(--color-border)'
          }`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-3)',
          minHeight: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: isSelected
            ? 'var(--shadow-focus), var(--shadow-md)'
            : isHovered
              ? 'var(--shadow-lg)'
              : 'var(--shadow-sm)',
          transform: isSelected ? 'translateY(-1px)' : 'none',
          transition: 'all var(--transition-fast)',
        }}
      >
        {/* Status indicators */}
        {isError && (
          <div
            className="error-indicator"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: 'var(--color-error-500)',
              borderRadius: '50%',
              boxShadow: '0 0 4px var(--color-error-500)',
            }}
          />
        )}

        {isExecuting && (
          <div
            className="executing-indicator"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: 'var(--color-primary-500)',
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
            }}
          />
        )}

        {/* Node icon */}
        <div
          className="node-icon"
          style={{
            marginBottom: 'var(--spacing-1)',
            opacity: isError ? 0.6 : 1,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <NodeIcon nodeType={nodeType} size={20} />
        </div>

        {/* Node label */}
        <div
          className="node-label"
          style={{
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--font-size-xs)',
            color: isError
              ? 'var(--color-error-600)'
              : isSelected
                ? 'var(--color-primary-700)'
                : 'var(--color-text-primary)',
            textAlign: 'center',
            lineHeight: 'var(--line-height-tight)',
            transition: 'color var(--transition-fast)',
          }}
        >
          {operation}
        </div>

        {/* Category badge */}
        <div
          className="category-badge"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            fontWeight: 'var(--font-weight-normal)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-wide)',
            marginTop: '2px',
          }}
        >
          {category}
        </div>
      </div>

      {/* Preview tooltip */}
      {showPreview && isHovered && (
        <div
          className="node-preview"
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-100%)',
            background: 'var(--color-surface-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: 0,
            animation: 'fadeInUp 0.2s ease-out forwards',
          }}
        >
          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{data.label || operation}</div>
          <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Double-click to configure
          </div>
        </div>
      )}

      {/* Enhanced connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          background: isSelected
            ? 'var(--color-primary-500)'
            : isHovered
              ? 'var(--color-accent-600)'
              : 'var(--color-border-strong)',
          border: '2px solid var(--color-surface-primary)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          cursor: 'crosshair',
          left: '-7px',
          transition: 'all var(--transition-fast)',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          zIndex: 10,
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: isSelected
            ? 'var(--color-primary-500)'
            : isHovered
              ? 'var(--color-accent-600)'
              : 'var(--color-border-strong)',
          border: '2px solid var(--color-surface-primary)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          cursor: 'crosshair',
          right: '-7px',
          transition: 'all var(--transition-fast)',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          zIndex: 10,
        }}
      />
    </div>
  );
}

export default CustomNode;

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-100%) translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(-100%);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;
document.head.appendChild(style);
