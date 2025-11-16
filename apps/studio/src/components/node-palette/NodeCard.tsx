import React, { useState, useRef } from 'react';
import { NodeIcon } from '../icons/IconSystem';
import type { NodeDefinition } from '@brepflow/types';
// import type { NodeMetadata } from '@brepflow/nodes-core';

// Node metadata interface for enhanced node discovery
interface NodeMetadata {
  label: string;
  description: string;
  category: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

interface NodeCardProps {
  node: NodeDefinition;
  metadata: NodeMetadata | undefined;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  onFavoriteToggle?: () => void;
  searchHighlight?: string;
  compact?: boolean;
  showDescription?: boolean;
}

function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight?.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export function NodeCard({
  node,
  metadata,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onHover,
  onHoverEnd,
  onDragStart,
  onFavoriteToggle,
  searchHighlight,
  compact = false,
  showDescription = false,
}: NodeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, node.type);

    // Add visual feedback for drag operation
    if (cardRef.current) {
      cardRef.current.style.opacity = '0.5';
      cardRef.current.style.transform = 'scale(0.95)';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Reset visual state
    if (cardRef.current) {
      cardRef.current.style.opacity = '';
      cardRef.current.style.transform = '';
    }
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsPressed(false);
    onHoverEnd?.();
  };

  const handleMouseEnter = () => onHover?.();

  const handleClick = () => onSelect?.();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  };

  const nodeLabel = metadata?.label || node.type.split('::').pop() || node.type;
  const nodeDescription = metadata?.description || '';
  const nodeTags = metadata?.tags || [];
  const nodeCategory = metadata?.category || node.category;

  return (
    <div
      ref={cardRef}
      className={`node-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPressed ? 'pressed' : ''} ${compact ? 'compact' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title={`${nodeLabel} - ${nodeDescription}`}
      aria-label={`Add ${nodeLabel} node to canvas`}
    >
      <div className="node-card-header">
        <div className="node-icon-container">
          <NodeIcon
            nodeType={node.type}
            size={compact ? 16 : 24}
            className={`node-card-icon ${isDragging ? 'dragging' : ''}`}
          />
        </div>

        {onFavoriteToggle && (
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className={`star-icon ${isFavorite ? 'filled' : ''}`}>
              {isFavorite ? '⭐' : '☆'}
            </span>
          </button>
        )}
      </div>

      <div className="node-card-content">
        <div className={`node-title ${compact ? 'compact' : ''}`}>
          <HighlightText text={nodeLabel} highlight={searchHighlight} />
        </div>

        {!compact && (
          <div className="node-category">
            <HighlightText text={nodeCategory} highlight={searchHighlight} />
          </div>
        )}

        {showDescription && nodeDescription && (
          <div className="node-description">
            <HighlightText
              text={
                nodeDescription.length > 60
                  ? `${nodeDescription.substring(0, 60)}...`
                  : nodeDescription
              }
              highlight={searchHighlight}
            />
          </div>
        )}
      </div>

      {!compact && nodeTags.length > 0 && (
        <div className="node-tags">
          {nodeTags.slice(0, 3).map((tag) => (
            <span key={tag} className="node-tag" title={tag}>
              <HighlightText text={tag} highlight={searchHighlight} />
            </span>
          ))}
          {nodeTags.length > 3 && (
            <span
              className="node-tag-more"
              title={`${nodeTags.length - 3} more tags: ${nodeTags.slice(3).join(', ')}`}
            >
              +{nodeTags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="node-card-overlay">
        <div className="drag-indicator">
          <span className="drag-icon">⋮⋮</span>
          <span className="drag-text">Drag to add</span>
        </div>
      </div>
    </div>
  );
}

// List item variant for list view
export function NodeListItem({
  node,
  metadata,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onHover,
  onHoverEnd,
  onDragStart,
  onFavoriteToggle,
  searchHighlight,
}: NodeCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, node.type);
  };

  const handleDragEnd = () => setIsDragging(false);

  const nodeLabel = metadata?.label || node.type.split('::').pop() || node.type;
  const nodeDescription = metadata?.description || '';
  const nodeTags = metadata?.tags || [];
  const nodeCategory = metadata?.category || node.category;

  return (
    <div
      className={`node-list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      title={nodeDescription}
      aria-label={`Add ${nodeLabel} node to canvas`}
    >
      <div className="node-list-icon">
        <NodeIcon nodeType={node.type} size={20} />
      </div>

      <div className="node-list-content">
        <div className="node-list-main">
          <div className="node-list-title">
            <HighlightText text={nodeLabel} highlight={searchHighlight} />
          </div>
          <div className="node-list-category">
            <HighlightText text={nodeCategory} highlight={searchHighlight} />
          </div>
        </div>

        {nodeDescription && (
          <div className="node-list-description">
            <HighlightText
              text={
                nodeDescription.length > 100
                  ? `${nodeDescription.substring(0, 100)}...`
                  : nodeDescription
              }
              highlight={searchHighlight}
            />
          </div>
        )}

        {nodeTags.length > 0 && (
          <div className="node-list-tags">
            {nodeTags.slice(0, 4).map((tag) => (
              <span key={tag} className="node-list-tag">
                <HighlightText text={tag} highlight={searchHighlight} />
              </span>
            ))}
            {nodeTags.length > 4 && (
              <span className="node-list-tag-more">+{nodeTags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="node-list-actions">
        {onFavoriteToggle && (
          <button
            className={`favorite-button-small ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className={`star-icon-small ${isFavorite ? 'filled' : ''}`}>
              {isFavorite ? '⭐' : '☆'}
            </span>
          </button>
        )}

        <div className="drag-handle" title="Drag to add to canvas">
          ⋮⋮
        </div>
      </div>
    </div>
  );
}

// Compact item for compact view
export function NodeCompactItem({
  node,
  metadata,
  isSelected = false,
  isFavorite = false,
  onSelect,
  onDragStart,
  onFavoriteToggle,
  searchHighlight,
}: NodeCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, node.type);
  };

  const handleDragEnd = () => setIsDragging(false);

  const nodeLabel = metadata?.label || node.type.split('::').pop() || node.type;

  return (
    <div
      className={`node-compact-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isFavorite ? 'favorite' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      title={`${nodeLabel} - ${metadata?.description || ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
    >
      <NodeIcon nodeType={node.type} size={14} />
      <span className="compact-label">
        <HighlightText text={nodeLabel} highlight={searchHighlight} />
      </span>
      {isFavorite && <span className="compact-star">⭐</span>}
    </div>
  );
}
