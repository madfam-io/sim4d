import React, { useState, useRef } from 'react';
import { NodeIcon } from './icons/IconSystem';
import './NodePanel.css';

const nodeCategories = [
  {
    name: 'Sketch',
    nodes: [
      { type: 'Sketch::Line', label: 'Line' },
      { type: 'Sketch::Circle', label: 'Circle' },
      { type: 'Sketch::Rectangle', label: 'Rectangle' },
      { type: 'Sketch::Arc', label: 'Arc' },
    ],
  },
  {
    name: 'Solid',
    nodes: [
      { type: 'Solid::Extrude', label: 'Extrude' },
      { type: 'Solid::Revolve', label: 'Revolve' },
      { type: 'Solid::Sweep', label: 'Sweep' },
      { type: 'Solid::Loft', label: 'Loft' },
      { type: 'Solid::Box', label: 'Box' },
      { type: 'Solid::Cylinder', label: 'Cylinder' },
      { type: 'Solid::Sphere', label: 'Sphere' },
    ],
  },
  {
    name: 'Boolean',
    nodes: [
      { type: 'Boolean::Union', label: 'Union' },
      { type: 'Boolean::Subtract', label: 'Subtract' },
      { type: 'Boolean::Intersect', label: 'Intersect' },
    ],
  },
  {
    name: 'Features',
    nodes: [
      { type: 'Features::Fillet', label: 'Fillet' },
      { type: 'Features::Chamfer', label: 'Chamfer' },
      { type: 'Features::Shell', label: 'Shell' },
      { type: 'Features::Draft', label: 'Draft' },
    ],
  },
  {
    name: 'Transform',
    nodes: [
      { type: 'Transform::Move', label: 'Move' },
      { type: 'Transform::Rotate', label: 'Rotate' },
      { type: 'Transform::Scale', label: 'Scale' },
      { type: 'Transform::Mirror', label: 'Mirror' },
      { type: 'Transform::LinearArray', label: 'Linear Array' },
      { type: 'Transform::CircularArray', label: 'Circular Array' },
    ],
  },
  {
    name: 'I/O',
    nodes: [
      { type: 'IO::ImportSTEP', label: 'Import STEP' },
      { type: 'IO::ExportSTEP', label: 'Export STEP' },
      { type: 'IO::ExportSTL', label: 'Export STL' },
    ],
  },
];

interface NodeItemProps {
  node: { type: string; label: string };
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function NodeItem({ node, onDragStart }: NodeItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, node.type);

    // Add visual feedback for drag operation
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5';
      dragRef.current.style.transform = 'scale(0.95)';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    // Reset visual state
    if (dragRef.current) {
      dragRef.current.style.opacity = '';
      dragRef.current.style.transform = '';
    }
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <div
      ref={dragRef}
      className={`node-item ${isDragging ? 'dragging' : ''} ${isPressed ? 'pressed' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      title={node.type}
    >
      <NodeIcon
        nodeType={node.type}
        size={16}
        className={`node-item-icon ${isDragging ? 'dragging' : ''}`}
      />
      <span className={`node-item-label ${isDragging ? 'dragging' : ''}`}>{node.label}</span>
    </div>
  );
}

interface CategorySectionProps {
  category: { name: string; nodes: { type: string; label: string }[] };
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function CategorySection({ category, onDragStart }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);

    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div
      className={`category-section ${isOpen ? 'open' : 'closed'} ${isAnimating ? 'animating' : ''}`}
    >
      <div className={`category-header ${isOpen ? 'expanded' : 'collapsed'}`} onClick={toggleOpen}>
        <span className={`expand-icon ${isOpen ? 'rotated' : ''}`}>▶</span>
        <span className="category-title">{category.name}</span>
        <span className="node-count">{category.nodes.length}</span>
      </div>

      <div
        ref={contentRef}
        className={`category-content ${isOpen ? 'visible' : 'hidden'}`}
        style={{
          maxHeight: isOpen ? `${category.nodes.length * 40 + 16}px` : '0px',
        }}
      >
        <div className="node-list">
          {category.nodes.map((node, index) => (
            <div
              key={node.type}
              className="node-item-wrapper"
              style={{
                animationDelay: isOpen ? `${index * 30}ms` : '0ms',
              }}
            >
              <NodeItem node={node} onDragStart={onDragStart} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NodePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = nodeCategories
    .map((category) => ({
      ...category,
      nodes: category.nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.type.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.nodes.length > 0);

  return (
    <div className="node-panel">
      <div className="panel-header">
        <h3 className="panel-title">Nodes</h3>
        <div className="panel-subtitle">Drag to add to canvas</div>
      </div>

      <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
        <div className="search-icon">🔍</div>
        <input
          type="text"
          placeholder="Search nodes..."
          className={`search-input ${isSearchFocused ? 'focused' : ''}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchTerm && (
          <button className="search-clear" onClick={() => setSearchTerm('')} title="Clear search">
            ×
          </button>
        )}
      </div>

      <div className="categories-container">
        {filteredCategories.map((category) => (
          <CategorySection key={category.name} category={category} onDragStart={onDragStart} />
        ))}

        {filteredCategories.length === 0 && searchTerm && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">No nodes found</div>
            <div className="no-results-hint">Try a different search term</div>
          </div>
        )}
      </div>
    </div>
  );
}
